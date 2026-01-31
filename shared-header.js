// UNCAGED Shared Header Component
// Include this script on any page to add the unified header with notifications

const UNCAGED_HEADER = {
    init: function() {
        this.injectStyles();
        this.createHeader();
        this.setupAuth();
        this.setupNotifications();
        this.setupSearch();
        this.setupDropdowns();
    },

    injectStyles: function() {
        const styles = `
        .unc-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: rgba(13,13,13,0.95); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: space-between; padding: 0 30px; z-index: 1000; border-bottom: 1px solid #2A2A2A; }
        .unc-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 3px; background: linear-gradient(135deg, #F5A623, #D4880F); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-decoration: none; }
        .unc-search-form { display: flex; align-items: center; background: #1A1A1A; border-radius: 25px; padding: 8px 16px; width: 400px; border: 2px solid transparent; transition: border-color 0.3s; }
        .unc-search-form:focus-within { border-color: #F5A623; }
        .unc-search-form input { background: none; border: none; color: #fff; font-size: 14px; width: 100%; outline: none; }
        .unc-search-form input::placeholder { color: #666; }
        .unc-search-form svg { color: #666; margin-right: 10px; flex-shrink: 0; }
        .unc-auth-area { display: flex; gap: 15px; align-items: center; }
        .unc-btn-login { color: #fff; text-decoration: none; font-size: 14px; }
        .unc-btn-signup { background: linear-gradient(135deg, #F5A623, #D4880F); color: #000; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .unc-upload-btn { background: #242424; color: #fff; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 14px; display: flex; align-items: center; gap: 6px; }
        .unc-upload-btn:hover { background: #2A2A2A; }
        .unc-notif-btn { position: relative; background: none; border: none; color: #B3B3B3; cursor: pointer; padding: 8px; }
        .unc-notif-btn:hover { color: #fff; }
        .unc-notif-btn svg { width: 22px; height: 22px; }
        .unc-notif-badge { position: absolute; top: 2px; right: 2px; background: #DC3545; color: #fff; font-size: 10px; padding: 2px 5px; border-radius: 10px; min-width: 16px; text-align: center; }
        .unc-profile-btn { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #F5A623, #D4880F); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; cursor: pointer; font-size: 14px; position: relative; border: none; }
        .unc-dropdown { position: absolute; top: 100%; right: 0; margin-top: 10px; background: #1A1A1A; border-radius: 12px; padding: 10px 0; min-width: 220px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: none; z-index: 1001; }
        .unc-dropdown.show { display: block; }
        .unc-dropdown a { display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: #B3B3B3; text-decoration: none; font-size: 14px; }
        .unc-dropdown a:hover { background: #242424; color: #fff; }
        .unc-dropdown a svg { width: 18px; height: 18px; }
        .unc-dropdown .divider { height: 1px; background: #2A2A2A; margin: 10px 0; }
        .unc-notif-dropdown { width: 360px; max-height: 400px; overflow-y: auto; }
        .unc-notif-dropdown .notif-header { padding: 15px 20px; border-bottom: 1px solid #2A2A2A; display: flex; justify-content: space-between; align-items: center; }
        .unc-notif-dropdown .notif-header h4 { font-size: 16px; color: #fff; }
        .unc-notif-dropdown .notif-header a { color: #F5A623; font-size: 13px; text-decoration: none; }
        .unc-notif-item { display: flex; gap: 12px; padding: 12px 20px; border-bottom: 1px solid #2A2A2A; cursor: pointer; }
        .unc-notif-item:hover { background: #242424; }
        .unc-notif-item.unread { background: rgba(245,166,35,0.05); }
        .unc-notif-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .unc-notif-icon.sub { background: rgba(40,167,69,0.2); color: #28A745; }
        .unc-notif-icon.comment { background: rgba(23,162,184,0.2); color: #17A2B8; }
        .unc-notif-icon svg { width: 20px; height: 20px; }
        .unc-notif-content { flex: 1; }
        .unc-notif-text { font-size: 13px; color: #B3B3B3; line-height: 1.4; }
        .unc-notif-text strong { color: #fff; }
        .unc-notif-time { font-size: 11px; color: #666; margin-top: 4px; }
        .unc-notif-empty { padding: 40px 20px; text-align: center; color: #666; }
        #unc-auth-logged-out, #unc-auth-logged-in { display: none; }
        @media (max-width: 768px) { .unc-search-form { width: 180px; } }
        @media (max-width: 480px) { .unc-search-form { display: none; } }
        `;
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    },

    createHeader: function() {
        const header = document.createElement('header');
        header.className = 'unc-header';
        header.innerHTML = `
            <a href="index.html" class="unc-logo">UNCAGED</a>
            <form class="unc-search-form" id="uncSearchForm">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search videos, creators..." id="uncSearchInput">
            </form>
            <div class="unc-auth-area">
                <div id="unc-auth-logged-out">
                    <a href="login.html" class="unc-btn-login">Log In</a>
                    <a href="signup.html" class="unc-btn-signup">Get Started</a>
                </div>
                <div id="unc-auth-logged-in">
                    <a href="upload.html" class="unc-upload-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload
                    </a>
                    <button class="unc-notif-btn" id="uncNotifBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        <span class="unc-notif-badge" id="uncNotifBadge" style="display:none">0</span>
                        <div class="unc-dropdown unc-notif-dropdown" id="uncNotifDropdown">
                            <div class="notif-header">
                                <h4>Notifications</h4>
                                <a href="notifications.html">See all</a>
                            </div>
                            <div id="uncNotifList">
                                <div class="unc-notif-empty">No notifications yet</div>
                            </div>
                        </div>
                    </button>
                    <button class="unc-profile-btn" id="uncProfileBtn">
                        V
                        <div class="unc-dropdown" id="uncProfileDropdown">
                            <a href="dashboard.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Dashboard</a>
                            <a href="my-videos.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>My Videos</a>
                            <a href="earnings.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Earnings</a>
                            <a href="stripe-connect.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Get Paid</a>
                            <div class="divider"></div>
                            <a href="settings.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</a>
                            <a href="#" id="uncLogoutBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Log Out</a>
                        </div>
                    </button>
                </div>
            </div>
        `;
        document.body.insertBefore(header, document.body.firstChild);
    },

    setupAuth: async function() {
        const { getAuth, onAuthStateChanged, signOut } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        
        const firebaseConfig = {
            apiKey: "AIzaSyDNPN3jptNzbR8vWy5hnVCuLoIBK2AW_HQ",
            authDomain: "uncaged-85b49.firebaseapp.com",
            projectId: "uncaged-85b49"
        };
        
        let app;
        try { app = initializeApp(firebaseConfig, 'header'); } 
        catch(e) { app = initializeApp(firebaseConfig); }
        
        const auth = getAuth(app);
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                document.getElementById('unc-auth-logged-out').style.display = 'none';
                document.getElementById('unc-auth-logged-in').style.display = 'flex';
                document.getElementById('unc-auth-logged-in').style.alignItems = 'center';
                document.getElementById('unc-auth-logged-in').style.gap = '10px';
                const initial = user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase();
                document.getElementById('uncProfileBtn').childNodes[0].textContent = initial;
            } else {
                document.getElementById('unc-auth-logged-out').style.display = 'flex';
                document.getElementById('unc-auth-logged-out').style.gap = '15px';
                document.getElementById('unc-auth-logged-in').style.display = 'none';
            }
        });

        document.getElementById('uncLogoutBtn').addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut(auth);
            window.location.href = 'index.html';
        });
    },

    setupNotifications: function() {
        // Demo notifications - in production, load from Firebase
        const notifications = [
            { type: 'sub', text: '<strong>John</strong> subscribed to you', time: '2h ago', unread: true },
            { type: 'comment', text: '<strong>Jane</strong> commented on your video', time: '5h ago', unread: true },
            { type: 'sub', text: '<strong>Mike</strong> subscribed to you', time: '1d ago', unread: false }
        ];

        const unreadCount = notifications.filter(n => n.unread).length;
        if (unreadCount > 0) {
            document.getElementById('uncNotifBadge').textContent = unreadCount;
            document.getElementById('uncNotifBadge').style.display = 'block';
        }

        const listEl = document.getElementById('uncNotifList');
        if (notifications.length > 0) {
            listEl.innerHTML = notifications.map(n => `
                <div class="unc-notif-item ${n.unread ? 'unread' : ''}">
                    <div class="unc-notif-icon ${n.type}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${n.type === 'sub' ? '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>' : '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'}
                        </svg>
                    </div>
                    <div class="unc-notif-content">
                        <div class="unc-notif-text">${n.text}</div>
                        <div class="unc-notif-time">${n.time}</div>
                    </div>
                </div>
            `).join('');
        }
    },

    setupSearch: function() {
        document.getElementById('uncSearchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('uncSearchInput').value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    },

    setupDropdowns: function() {
        // Profile dropdown
        document.getElementById('uncProfileBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('uncProfileDropdown').classList.toggle('show');
            document.getElementById('uncNotifDropdown').classList.remove('show');
        });

        // Notification dropdown
        document.getElementById('uncNotifBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('uncNotifDropdown').classList.toggle('show');
            document.getElementById('uncProfileDropdown').classList.remove('show');
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            document.getElementById('uncProfileDropdown').classList.remove('show');
            document.getElementById('uncNotifDropdown').classList.remove('show');
        });

        // Prevent dropdown close when clicking inside
        document.querySelectorAll('.unc-dropdown').forEach(dd => {
            dd.addEventListener('click', (e) => e.stopPropagation());
        });
    }
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UNCAGED_HEADER.init());
} else {
    UNCAGED_HEADER.init();
}
