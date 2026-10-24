/* ==========================================================================
   ShopWave - Firebase Database & Authentication Configuration
   ========================================================================== */

/**
 * FIREBASE SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/ and create a new project.
 * 2. In Project Overview, click the Web icon (</>) to create a Web App.
 * 3. Copy the "firebaseConfig" object values and replace the placeholders below.
 * 4. Enable Authentication -> Sign-in method -> Email/Password & Google.
 * 5. Enable Cloud Firestore Database (in Test Mode for development).
 */

const firebaseConfig = {
  apiKey: "AIzaSyA_M57gGXekDeTflcqrXNelZeQc-vQbl3c",
  authDomain: "shopwave-store-5df09.firebaseapp.com",
  projectId: "shopwave-store-5df09",
  storageBucket: "shopwave-store-5df09.firebasestorage.app",
  messagingSenderId: "48117949118",
  appId: "1:48117949118:web:42db1013ab37a1f28574ef",
  measurementId: "G-69FP9CK9HD"
};

// Internal Firebase instances
let fbApp = null;
let fbAuth = null;
let fbDb = null;

const isConfigured = () => {
  return (
    typeof firebase !== 'undefined' &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
};

// Initialize Firebase if credentials provided
if (isConfigured()) {
  try {
    fbApp = firebase.initializeApp(firebaseConfig);
    fbAuth = firebase.auth();
    fbDb = firebase.firestore();
    console.log('✅ Firebase initialized successfully with Cloud Firestore & Auth.');
  } catch (err) {
    console.warn('⚠️ Firebase initialization failed:', err);
  }
} else {
  console.info('ℹ️ Firebase is in Local/Demo Mode. Add your Firebase credentials in firebase-config.js to enable Cloud Firestore.');
}

/**
 * ShopWave Firebase Service Interface
 */
window.ShopWaveFirebase = {
  config: firebaseConfig,

  isReady() {
    return isConfigured() && fbAuth !== null && fbDb !== null;
  },

  // ---- Authentication ----
  async signUp(name, email, password) {
    if (!this.isReady()) throw new Error('Firebase is not configured with your API keys.');
    const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
    const user = cred.user;

    // Update display name
    await user.updateProfile({ displayName: name });

    // Create user document in Firestore 'users' collection
    await fbDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      name: name,
      email: email.toLowerCase(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      phone: '',
      address: '',
      city: '',
      postal: ''
    }, { merge: true });

    return user;
  },

  async signIn(email, password) {
    if (!this.isReady()) throw new Error('Firebase is not configured with your API keys.');
    const cred = await fbAuth.signInWithEmailAndPassword(email, password);
    return cred.user;
  },

  async signInWithGoogle() {
    if (!this.isReady()) throw new Error('Firebase is not configured with your API keys.');
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await fbAuth.signInWithPopup(provider);
    const user = result.user;

    // Ensure document exists in 'users' collection
    const docRef = fbDb.collection('users').doc(user.uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set({
        uid: user.uid,
        name: user.displayName || 'Google User',
        email: (user.email || '').toLowerCase(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        phone: '',
        address: '',
        city: '',
        postal: ''
      });
    }

    return user;
  },

  async resetPassword(email) {
    if (!this.isReady()) throw new Error('Firebase is not configured with your API keys.');
    await fbAuth.sendPasswordResetEmail(email);
  },

  async signOut() {
    if (!this.isReady()) return;
    await fbAuth.signOut();
  },

  // ---- User Profile ----
  async getUserProfile(uid) {
    if (!this.isReady()) return null;
    const snap = await fbDb.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
  },

  async saveUserProfile(uid, profileData) {
    if (!this.isReady()) return;
    const cleanData = {
      name: profileData.name || '',
      phone: profileData.phone || '',
      address: profileData.address || '',
      city: profileData.city || '',
      postal: profileData.postal || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await fbDb.collection('users').doc(uid).set(cleanData, { merge: true });
  },

  // ---- Orders Database ----
  async createOrder(order) {
    if (!this.isReady()) return null;
    const orderDoc = {
      orderId: order.id,
      uid: order.uid || null,
      name: order.name || '',
      email: order.email || '',
      city: order.city || '',
      items: order.items || [],
      total: order.total || 0,
      promo: order.promo || null,
      pay: order.pay || 'cod',
      status: 'Processing',
      date: order.date || new Date().toISOString(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Save to top-level 'orders' collection
    await fbDb.collection('orders').doc(order.id).set(orderDoc);

    // If user is logged in, also mirror inside user's sub-collection
    if (order.uid) {
      await fbDb.collection('users').doc(order.uid).collection('orders').doc(order.id).set(orderDoc);
    }

    return orderDoc;
  },

  async getUserOrders(uid) {
    if (!this.isReady() || !uid) return [];
    try {
      const snap = await fbDb.collection('orders')
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();

      return snap.docs.map(doc => doc.data());
    } catch (err) {
      // Fallback without ordering if index is not created yet
      const snap = await fbDb.collection('orders').where('uid', '==', uid).get();
      return snap.docs.map(doc => doc.data());
    }
  },

  // ---- Cart & Wishlist Sync ----
  async saveUserCart(uid, cart) {
    if (!this.isReady() || !uid) return;
    await fbDb.collection('users').doc(uid).set({
      cart: cart,
      cartUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  },

  async getUserCart(uid) {
    if (!this.isReady() || !uid) return null;
    const snap = await fbDb.collection('users').doc(uid).get();
    return snap.exists && snap.data().cart ? snap.data().cart : null;
  },

  async saveUserWishlist(uid, wish) {
    if (!this.isReady() || !uid) return;
    await fbDb.collection('users').doc(uid).set({
      wishlist: wish,
      wishlistUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  },

  async getUserWishlist(uid) {
    if (!this.isReady() || !uid) return null;
    const snap = await fbDb.collection('users').doc(uid).get();
    return snap.exists && snap.data().wishlist ? snap.data().wishlist : null;
  },

  // ---- Newsletter Database ----
  async saveNewsletter(email) {
    if (!this.isReady() || !email) return;
    const safeKey = email.replace(/[@.]/g, '_');
    await fbDb.collection('newsletter').doc(safeKey).set({
      email: email.toLowerCase(),
      subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
};
