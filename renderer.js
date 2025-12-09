// Renderer process logic for Venice Local
// Handles authentication, data seeding, filtering/sorting, reviews with verification, favorites, and owner tools.

const storageKeys = {
  users: 'vl_users',
  businesses: 'vl_businesses',
  favorites: 'vl_favorites',
  seeded: 'vl_seeded'
};

let currentUser = null;
let businesses = [];
let users = [];
let favorites = {};

// -----------------------------
// LocalStorage helpers
// -----------------------------
function loadData() {
  users = JSON.parse(localStorage.getItem(storageKeys.users) || '[]');
  businesses = JSON.parse(localStorage.getItem(storageKeys.businesses) || '[]');
  favorites = JSON.parse(localStorage.getItem(storageKeys.favorites) || '{}');
}

function saveUsers() {
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
}

function saveBusinesses() {
  localStorage.setItem(storageKeys.businesses, JSON.stringify(businesses));
}

function saveFavorites() {
  localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites));
}

// -----------------------------
// Seed data on first launch
// -----------------------------
function seedData() {
  if (localStorage.getItem(storageKeys.seeded)) return;

  const sampleBusinesses = [
    {
      id: crypto.randomUUID(),
      name: 'Seabreeze Café',
      category: 'Food',
      address: '101 W Venice Ave, Venice, FL',
      shortDescription: 'Beachy café serving fresh pastries, Cuban coffee, and smoothies.',
      hours: 'Mon-Sun: 7:00a - 3:00p',
      specialDeals: '10% off for residents with local ID',
      ownerUserId: null,
      reviews: [
        { userId: 'seed1', userName: 'Local Foodie', rating: 5, comment: 'Love the guava pastries!', date: '2024-11-02' },
        { userId: 'seed2', userName: 'Beach Walker', rating: 4, comment: 'Great espresso and friendly staff.', date: '2024-12-10' }
      ],
      averageRating: 4.5
    },
    {
      id: crypto.randomUUID(),
      name: 'Island Boutique',
      category: 'Retail',
      address: '210 Miami Ave W, Venice, FL',
      shortDescription: 'Coastal-inspired apparel, handmade jewelry, and gifts from local artisans.',
      hours: 'Mon-Sat: 10:00a - 6:00p',
      specialDeals: 'Buy 2 accessories, get 1 free',
      ownerUserId: null,
      reviews: [
        { userId: 'seed3', userName: 'Style Maven', rating: 5, comment: 'Unique finds and friendly owner.', date: '2025-01-06' }
      ],
      averageRating: 5
    },
    {
      id: crypto.randomUUID(),
      name: 'Gulfside Yoga Loft',
      category: 'Wellness',
      address: '301 Nassau St S, Venice, FL',
      shortDescription: 'Relaxed studio offering sunrise yoga and mindful meditation.',
      hours: 'Mon-Fri: 6:30a - 8:00p; Sat: 8:00a - 2:00p',
      specialDeals: 'First class free for Venice locals',
      ownerUserId: null,
      reviews: [
        { userId: 'seed4', userName: 'Calm Seeker', rating: 4, comment: 'Peaceful space, loved the instructor.', date: '2025-02-12' },
        { userId: 'seed5', userName: 'Sunrise Fan', rating: 5, comment: 'Sunrise flow is magical.', date: '2025-03-04' }
      ],
      averageRating: 4.5
    },
    {
      id: crypto.randomUUID(),
      name: 'Mangrove Makerspace',
      category: 'Services',
      address: '145 Tampa Ave E, Venice, FL',
      shortDescription: 'Community workshop for 3D printing, laser cutting, and DIY builds.',
      hours: 'Tue-Sun: 9:00a - 7:00p',
      specialDeals: 'Student discount: 15% off day passes',
      ownerUserId: null,
      reviews: [
        { userId: 'seed6', userName: 'DIY Dad', rating: 5, comment: 'Staff helped me finish a wood project.', date: '2024-10-19' }
      ],
      averageRating: 5
    },
    {
      id: crypto.randomUUID(),
      name: 'Venice Gelato Co.',
      category: 'Food',
      address: '225 W Miami Ave, Venice, FL',
      shortDescription: 'Small-batch gelato inspired by Gulf flavors.',
      hours: 'Daily: 11:00a - 10:00p',
      specialDeals: '2-for-1 scoops on Tuesdays',
      ownerUserId: null,
      reviews: [
        { userId: 'seed7', userName: 'Sweet Tooth', rating: 5, comment: 'Key lime gelato is perfect.', date: '2025-01-28' },
        { userId: 'seed8', userName: 'Date Night', rating: 4, comment: 'Cozy vibe and friendly team.', date: '2025-02-08' }
      ],
      averageRating: 4.5
    }
  ];

  localStorage.setItem(storageKeys.businesses, JSON.stringify(sampleBusinesses));
  localStorage.setItem(storageKeys.users, JSON.stringify([]));
  localStorage.setItem(storageKeys.favorites, JSON.stringify({}));
  localStorage.setItem(storageKeys.seeded, 'true');
}

// -----------------------------
// Utility helpers
// -----------------------------
function calculateAverage(reviews = []) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function buildAvatarPlaceholder(name = 'Guest') {
  const initial = (name.trim()[0] || 'G').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" rx="18" fill="%23175f62"/><text x="50%" y="55%" font-family="Manrope, Arial, sans-serif" font-size="70" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function setView(target) {
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('animate-in');
  });
  const selected = document.getElementById(`${target}-section`);
  if (selected) {
    selected.classList.remove('hidden');
    selected.classList.add('animate-in');
    setTimeout(() => selected.classList.remove('animate-in'), 350);
  }
}

function updateRoleVisibility() {
  document.querySelectorAll('.owner-only').forEach(btn => {
    btn.style.display = currentUser && currentUser.role === 'owner' ? 'inline-flex' : 'none';
  });
  const roleNote = document.getElementById('role-note');
  const authBtn = document.getElementById('logout-btn');

  if (!currentUser || currentUser.role === 'guest') {
    roleNote.textContent = 'Guests can browse but must sign in to review, save favorites, or add businesses.';
    if (authBtn) authBtn.textContent = 'Sign In / Create Account';
  } else if (currentUser.role === 'owner') {
    roleNote.textContent = 'Business Owners can add/edit their listings and leave reviews.';
    if (authBtn) authBtn.textContent = 'Logout';
  } else {
    roleNote.textContent = 'Local Patrons can leave reviews and save favorites.';
    if (authBtn) authBtn.textContent = 'Logout';
  }
}

function renderProfile() {
  document.getElementById('profile-name').textContent = currentUser?.name || 'Guest';
  document.getElementById('profile-email').textContent = currentUser?.email || 'Not signed in';
  document.getElementById('profile-role').textContent = currentUser?.role || 'Guest';
  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) {
    const placeholder = buildAvatarPlaceholder(currentUser?.name || 'Guest');
    const src = currentUser?.avatar || placeholder;
    avatarEl.onerror = () => { avatarEl.onerror = null; avatarEl.src = placeholder; };
    avatarEl.src = src;
    avatarEl.alt = `${currentUser?.name || 'Guest'} avatar`;
  }
  const topbarAvatar = document.getElementById('topbar-avatar');
  if (topbarAvatar) {
    const placeholder = buildAvatarPlaceholder(currentUser?.name || 'Guest');
    const src = currentUser?.avatar || placeholder;
    topbarAvatar.onerror = () => { topbarAvatar.onerror = null; topbarAvatar.src = placeholder; };
    topbarAvatar.src = src;
    topbarAvatar.alt = `${currentUser?.name || 'Guest'} avatar`;
  }
}

async function updateProfilePhoto(event) {
  event.preventDefault();
  const errorEl = document.getElementById('profile-avatar-error');
  const successEl = document.getElementById('profile-avatar-success');
  const urlInput = document.getElementById('profile-avatar-url');
  const fileInput = document.getElementById('profile-avatar-file');
  errorEl.textContent = '';
  successEl.textContent = '';

  if (!currentUser || currentUser.role === 'guest') {
    errorEl.textContent = 'Sign in to update your profile photo.';
    return;
  }

  const avatarUrl = urlInput.value.trim();
  const avatarFile = fileInput.files[0];

  if (!avatarUrl && !avatarFile) {
    errorEl.textContent = 'Provide a photo URL or upload an image.';
    return;
  }

  try {
    const avatar = avatarFile ? await readFileAsDataURL(avatarFile) : avatarUrl;
    currentUser.avatar = avatar;
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx >= 0) users[idx].avatar = avatar;
    saveUsers();
    renderProfile();
    successEl.textContent = 'Profile photo updated.';
    document.getElementById('profile-photo-form').reset();
  } catch (err) {
    errorEl.textContent = 'Could not read photo. Try again.';
  }
}

function renderBusinesses() {
  const listEl = document.getElementById('business-list');
  listEl.innerHTML = '';

  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-filter').value;
  const sortBy = document.getElementById('sort-select').value;

  let filtered = businesses.filter(biz => {
    const matchesSearch = biz.name.toLowerCase().includes(searchTerm) || biz.shortDescription.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'all' || biz.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sortBy === 'reviews') {
    filtered.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
  } else if (sortBy === 'alpha') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  document.getElementById('empty-list').classList.toggle('hidden', filtered.length > 0);

  filtered.forEach(biz => {
    const card = document.createElement('div');
    card.className = 'card business-card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${biz.name}</h3>
          <p class="muted">${biz.category} • ${biz.address}</p>
        </div>
        <div class="rating-chip"><span class="star">⭐</span><span>${biz.averageRating.toFixed(1)}</span></div>
      </div>
      <p class="description">${biz.shortDescription}</p>
      <div class="card-footer">
        <span class="deal-pill">${biz.specialDeals ? 'Deals available' : 'No deals posted'}</span>
        <div>
          ${renderFavoriteButton(biz.id)}
          <button class="ghost-btn" data-detail="${biz.id}">Details</button>
        </div>
      </div>
    `;
    listEl.appendChild(card);
  });
}

function renderFavoriteButton(businessId) {
  if (!currentUser || currentUser.role === 'guest') return '';
  const saved = favorites[currentUser.id]?.includes(businessId);
  return `<button class="secondary-btn" data-fav="${businessId}">${saved ? '★ Saved' : '♡ Save'}</button>`;
}

function renderFavoritesView() {
  const favSection = document.getElementById('favorites-list');
  favSection.innerHTML = '';
  const favoriteIds = favorites[currentUser?.id] || [];
  const savedBusinesses = businesses.filter(b => favoriteIds.includes(b.id));
  document.getElementById('empty-favorites').classList.toggle('hidden', savedBusinesses.length > 0);

  savedBusinesses.forEach(biz => {
    const card = document.createElement('div');
    card.className = 'card business-card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${biz.name}</h3>
          <p class="muted">${biz.category} • ${biz.address}</p>
        </div>
        <div class="rating-chip"><span class="star">⭐</span><span>${biz.averageRating.toFixed(1)}</span></div>
      </div>
      <p class="description">${biz.shortDescription}</p>
      <div class="card-footer">
        <span class="deal-pill">${biz.specialDeals ? 'Deals available' : 'No deals posted'}</span>
        <div>
          <button class="secondary-btn" data-fav="${biz.id}">★ Saved</button>
          <button class="ghost-btn" data-detail="${biz.id}">Details</button>
        </div>
      </div>
    `;
    favSection.appendChild(card);
  });
}

// -----------------------------
// Authentication
// -----------------------------
function showAuthCard(mode = 'choice') {
  const choice = document.getElementById('auth-choice-card');
  const signup = document.getElementById('signup-card');
  const signin = document.getElementById('signin-card');
  [choice, signup, signin].forEach(card => {
    if (card) card.classList.add('hidden');
  });
  if (mode === 'signup' && signup) signup.classList.remove('hidden');
  else if (mode === 'signin' && signin) signin.classList.remove('hidden');
  else if (choice) choice.classList.remove('hidden');
}

async function signUp(event) {
  event.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value.trim();
  const avatarUrl = document.getElementById('signup-avatar').value.trim();
  const avatarFile = document.getElementById('signup-avatar-file').files[0];
  const role = document.getElementById('signup-role').value;
  const humanCheck = document.getElementById('signup-human').checked;
  const challenge = document.getElementById('signup-challenge').value.trim().toUpperCase();
  const errorEl = document.getElementById('signup-error');
  errorEl.textContent = '';

  if (!name || !email || !password || !role) {
    errorEl.textContent = 'Please fill every field and choose a role.';
    return;
  }
  if (!humanCheck || challenge !== 'VENICE') {
    errorEl.textContent = 'Verification failed. Please confirm you are human and type VENICE.';
    return;
  }
  if (users.some(u => u.email === email)) {
    errorEl.textContent = 'An account with this email already exists.';
    return;
  }

  try {
    const avatar = avatarFile ? await readFileAsDataURL(avatarFile) : avatarUrl;
    const newUser = { id: crypto.randomUUID(), name, email, password, role, avatar };
    users.push(newUser);
    saveUsers();
    currentUser = newUser;
    enterApp();
  } catch (err) {
    errorEl.textContent = 'Could not read profile photo. Please try again or use a URL.';
  }
}

function signIn(event) {
  event.preventDefault();
  const email = document.getElementById('signin-email').value.trim().toLowerCase();
  const password = document.getElementById('signin-password').value.trim();
  const math = Number(document.getElementById('signin-math').value);
  const errorEl = document.getElementById('signin-error');
  errorEl.textContent = '';

  if (math !== 5) {
    errorEl.textContent = 'Bot check failed. 2 + 3 should equal 5.';
    return;
  }

  const found = users.find(u => u.email === email && u.password === password);
  if (!found) {
    errorEl.textContent = 'Invalid credentials. Please try again or create an account.';
    return;
  }
  currentUser = found;
  enterApp();
}

function continueAsGuest() {
  currentUser = { id: 'guest', name: 'Guest', email: 'guest', role: 'guest', avatar: '' };
  enterApp();
}

function enterApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  updateRoleVisibility();
  renderProfile();
  renderBusinesses();
  renderFavoritesView();
  setView('list');
}

function logout() {
  currentUser = null;
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('signin-form').reset();
  document.getElementById('signup-form').reset();
  showAuthCard('choice');
  const profileForm = document.getElementById('profile-photo-form');
  if (profileForm) profileForm.reset();
  const profileError = document.getElementById('profile-avatar-error');
  const profileSuccess = document.getElementById('profile-avatar-success');
  if (profileError) profileError.textContent = '';
  if (profileSuccess) profileSuccess.textContent = '';
}

// -----------------------------
// Business detail modal & reviews
// -----------------------------
function openDetail(businessId) {
  const biz = businesses.find(b => b.id === businessId);
  if (!biz) return;
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-body');
  const reviewsHTML = biz.reviews && biz.reviews.length
    ? biz.reviews.map(r => `<div class="review"><div class="review-header"><strong>${r.userName}</strong> • ${new Date(r.date).toLocaleDateString()}</div><div class="review-rating">⭐ ${r.rating}</div><p>${r.comment}</p></div>`).join('')
    : '<p class="empty-text">Be the first to review this business!</p>';

  const canEdit = currentUser && currentUser.role === 'owner' && biz.ownerUserId === currentUser.id;
  const canReview = currentUser && currentUser.role !== 'guest';

  body.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${biz.name}</h2>
        <p class="muted">${biz.category} • ${biz.address}</p>
        <p>${biz.shortDescription}</p>
        <p><strong>Hours:</strong> ${biz.hours}</p>
      </div>
      <div class="rating-large"><span>${biz.averageRating.toFixed(1)}</span></div>
    </div>
    <div class="deal-banner">Special deals: ${biz.specialDeals || 'No deals posted yet.'}</div>
    <div class="detail-actions">
      ${renderFavoriteButton(biz.id)}
      ${canEdit ? `<button class="secondary-btn" data-edit="${biz.id}">Edit Business</button>` : ''}
    </div>
    <h3>Reviews</h3>
    <div class="reviews">${reviewsHTML}</div>
    ${canReview ? reviewFormTemplate(biz.id) : '<p class="muted">Sign in to leave a review.</p>'}
  `;

  modal.classList.remove('hidden');
}

function reviewFormTemplate(id) {
  return `
    <form class="review-form" data-review="${id}">
      <label>Rating (1-5)<input type="number" min="1" max="5" required></label>
      <label>Comment<textarea rows="2" required></textarea></label>
      <label>Type the word LOCAL to verify<input type="text" placeholder="LOCAL" required></label>
      <button type="submit" class="primary-btn">Submit Review</button>
      <p class="error form-error"></p>
    </form>
  `;
}

function closeDetail() {
  document.getElementById('detail-modal').classList.add('hidden');
  document.getElementById('detail-body').innerHTML = '';
}

function submitReview(form) {
  const bizId = form.getAttribute('data-review');
  const ratingInput = form.querySelector('input[type="number"]');
  const commentInput = form.querySelector('textarea');
  const verifyInput = form.querySelector('input[type="text"]');
  const errorEl = form.querySelector('.form-error');
  errorEl.textContent = '';

  const rating = Number(ratingInput.value);
  const comment = commentInput.value.trim();
  const verify = verifyInput.value.trim().toUpperCase();

  if (!rating || rating < 1 || rating > 5) {
    errorEl.textContent = 'Rating must be between 1 and 5.';
    return;
  }
  if (!comment) {
    errorEl.textContent = 'Please add a short comment.';
    return;
  }
  if (verify !== 'LOCAL') {
    errorEl.textContent = 'Verification failed. Type LOCAL to confirm you are human.';
    return;
  }

  const biz = businesses.find(b => b.id === bizId);
  if (!biz) return;

  const newReview = {
    userId: currentUser.id,
    userName: currentUser.name,
    rating,
    comment,
    date: new Date().toISOString()
  };
  biz.reviews.push(newReview);
  biz.averageRating = calculateAverage(biz.reviews);
  saveBusinesses();
  renderBusinesses();
  renderFavoritesView();
  openDetail(bizId); // re-render detail with new review
}

// -----------------------------
// Favorites
// -----------------------------
function toggleFavorite(businessId) {
  if (!currentUser || currentUser.role === 'guest') return;
  favorites[currentUser.id] = favorites[currentUser.id] || [];
  const list = favorites[currentUser.id];
  const index = list.indexOf(businessId);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(businessId);
  }
  saveFavorites();
  renderBusinesses();
  renderFavoritesView();
}

// -----------------------------
// Add / Edit business
// -----------------------------
function submitBusiness(event) {
  event.preventDefault();
  const name = document.getElementById('business-name').value.trim();
  const category = document.getElementById('business-category').value;
  const address = document.getElementById('business-address').value.trim();
  const description = document.getElementById('business-description').value.trim();
  const hours = document.getElementById('business-hours').value.trim();
  const deals = document.getElementById('business-deals').value.trim();
  const errorEl = document.getElementById('add-error');
  const successEl = document.getElementById('add-success');
  errorEl.textContent = '';
  successEl.textContent = '';

  if (!name || !category || !address || !description || !hours) {
    errorEl.textContent = 'All fields except deals are required.';
    return;
  }
  if (!address.toLowerCase().includes('venice')) {
    errorEl.textContent = 'Address must reference Venice, FL (downtown).';
    return;
  }

  const editingId = event.target.getAttribute('data-editing');
  if (editingId) {
    const biz = businesses.find(b => b.id === editingId);
    if (biz && biz.ownerUserId === currentUser.id) {
      biz.name = name;
      biz.category = category;
      biz.address = address;
      biz.shortDescription = description;
      biz.hours = hours;
      biz.specialDeals = deals;
    }
    event.target.removeAttribute('data-editing');
    successEl.textContent = 'Business updated successfully.';
  } else {
    const newBusiness = {
      id: crypto.randomUUID(),
      name,
      category,
      address,
      shortDescription: description,
      hours,
      specialDeals: deals,
      ownerUserId: currentUser.id,
      reviews: [],
      averageRating: 0
    };
    businesses.push(newBusiness);
    successEl.textContent = 'Business added successfully.';
  }

  saveBusinesses();
  renderBusinesses();
  renderFavoritesView();
  event.target.reset();
}

function startEditBusiness(bizId) {
  const biz = businesses.find(b => b.id === bizId);
  if (!biz || biz.ownerUserId !== currentUser.id) return;
  setView('add');
  const form = document.getElementById('add-business-form');
  form.setAttribute('data-editing', bizId);
  document.getElementById('business-name').value = biz.name;
  document.getElementById('business-category').value = biz.category;
  document.getElementById('business-address').value = biz.address;
  document.getElementById('business-description').value = biz.shortDescription;
  document.getElementById('business-hours').value = biz.hours;
  document.getElementById('business-deals').value = biz.specialDeals;
  document.getElementById('add-success').textContent = 'Editing your business. Save changes when ready.';
}

// -----------------------------
// Event bindings
// -----------------------------
function bindEvents() {
  document.getElementById('signup-form').addEventListener('submit', signUp);
  document.getElementById('signin-form').addEventListener('submit', signIn);
  document.getElementById('start-create-btn').addEventListener('click', () => showAuthCard('signup'));
  document.getElementById('start-signin-btn').addEventListener('click', () => showAuthCard('signin'));
  document.getElementById('guest-btn').addEventListener('click', continueAsGuest);
  document.querySelectorAll('[data-auth-back]').forEach(btn => {
    btn.addEventListener('click', () => showAuthCard('choice'));
  });
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('profile-photo-form').addEventListener('submit', updateProfilePhoto);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const target = btn.getAttribute('data-target');
    if (target) {
      btn.addEventListener('click', () => {
        setView(target);
        if (target === 'favorites') renderFavoritesView();
      });
    }
  });

  document.querySelectorAll('.avatar-chip').forEach(chip => {
    const target = chip.getAttribute('data-target');
    if (target) {
      chip.addEventListener('click', () => setView(target));
    }
  });

  document.getElementById('search-input').addEventListener('input', renderBusinesses);
  document.getElementById('category-filter').addEventListener('change', renderBusinesses);
  document.getElementById('sort-select').addEventListener('change', renderBusinesses);

  document.getElementById('business-list').addEventListener('click', (e) => {
    if (e.target.dataset.detail) {
      openDetail(e.target.dataset.detail);
    }
    if (e.target.dataset.fav) {
      toggleFavorite(e.target.dataset.fav);
    }
  });

  document.getElementById('favorites-list').addEventListener('click', (e) => {
    if (e.target.dataset.detail) openDetail(e.target.dataset.detail);
    if (e.target.dataset.fav) toggleFavorite(e.target.dataset.fav);
  });

  document.getElementById('detail-modal').addEventListener('click', (e) => {
    if (e.target.id === 'detail-modal') closeDetail();
  });
  document.getElementById('close-detail').addEventListener('click', closeDetail);

  document.getElementById('detail-body').addEventListener('submit', (e) => {
    if (e.target.dataset.review) {
      e.preventDefault();
      submitReview(e.target);
    }
  });

  document.getElementById('detail-body').addEventListener('click', (e) => {
    if (e.target.dataset.fav) toggleFavorite(e.target.dataset.fav);
    if (e.target.dataset.edit) startEditBusiness(e.target.dataset.edit);
  });

  document.getElementById('add-business-form').addEventListener('submit', submitBusiness);

}

// -----------------------------
// Initialization
// -----------------------------
window.addEventListener('DOMContentLoaded', () => {
  seedData();
  loadData();
  bindEvents();
  showAuthCard('choice');
  renderBusinesses();
});
