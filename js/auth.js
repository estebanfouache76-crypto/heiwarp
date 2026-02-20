// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.init();
    }

    init() {
        this.loadUsers();
        this.resetAllUsersCoins(); // Reset all users to 0 coins
        this.initializeDefaultUsers();
        this.checkLoginStatus();
    }

    resetAllUsersCoins() {
        // Reset all existing users to 0 coins
        this.users.forEach(user => {
            user.coins = 0;
        });
        this.saveUsers();
    }

    initializeDefaultUsers() {
        // Create default admin user if no users exist
        if (this.users.length === 0) {
            const defaultAdmin = {
                id: 1,
                username: 'admin',
                email: 'admin@heiwa.fr',
                password: this.hashPassword('admin123'), // Hashed password
                coins: 0, // Admin starts with 0 coins too
                isAdmin: true,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            const defaultUser = {
                id: 2,
                username: 'user',
                email: 'user@heiwa.fr',
                password: this.hashPassword('password'),
                coins: 0, // User starts with 0 coins
                isAdmin: false,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            this.users.push(defaultAdmin, defaultUser);
                this.saveUsers();
                
                console.log('Utilisateurs par défaut créés:', this.users);
        }
    }

    loadUsers() {
        const users = localStorage.getItem('users');
        this.users = users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    checkLoginStatus() {
        // Login is no longer required - users can browse without being logged in
        return true;
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    login(username, password) {
        // Hash the provided password to compare with stored hash
        const hashedPassword = this.hashPassword(password);
        const user = this.users.find(u => u.username === username && u.password === hashedPassword);
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.setCurrentUser(user);
        }
        return user;
    }

    register(userData) {
        // Check if username already exists
        if (this.users.some(u => u.username === userData.username)) {
            return { success: false, message: 'Ce nom d\'utilisateur est déjà pris' };
        }

        // Hash password for security (in production)
        const hashedPassword = this.hashPassword(userData.password);

        // Create new user with 0 coins
        const newUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            password: hashedPassword, // Store hashed password
            coins: 0,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        this.setCurrentUser(newUser);
        
        return { success: true, user: newUser };
    }

    hashPassword(password) {
            // Simple hash for demo (in production, use bcrypt)
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash.toString();
        }

        // Debug function to test hashing
        testHashing() {
            console.log('Test du hashage:');
            console.log('admin123 ->', this.hashPassword('admin123'));
            console.log('password ->', this.hashPassword('password'));
            
            // Check if default users exist with correct hashes
            const users = this.getUsers();
            console.log('Utilisateurs actuels:', users);
            
            const adminUser = users.find(u => u.username === 'admin');
            if (adminUser) {
                console.log('Hash admin stocké:', adminUser.password);
                console.log('Hash admin calculé:', this.hashPassword('admin123'));
                console.log('Hashs identiques?', adminUser.password === this.hashPassword('admin123'));
            }
        }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    getUserById(id) {
        return this.users.find(u => u.id === id);
    }

    updateUserCoins(userId, coins) {
        const user = this.getUserById(userId);
        if (user) {
            user.coins = coins;
            this.saveUsers();
            return true;
        }
        return false;
    }

    deleteUser(id) {
        this.users = this.users.filter(u => u.id !== id);
        this.saveUsers();
        return true;
    }

    getUsers() {
        return this.users;
    }

    getStats() {
        const totalUsers = this.users.length;
        const totalCoins = this.users.reduce((sum, user) => sum + user.coins, 0);
        const avgCoins = totalUsers > 0 ? Math.round(totalCoins / totalUsers) : 0;
        const adminCount = this.users.filter(user => user.isAdmin).length;
        
        return {
            totalUsers,
            totalCoins,
            avgCoins,
            adminCount
        };
    }
}

// Coins System
class CoinsSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = this.getCurrentUser();
        this.initializeCoins();
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    initializeCoins() {
        // Always display coins from logged in user
        this.updateCoinsDisplay();
    }

    updateCoinsDisplay() {
        const currentUser = this.getCurrentUser();
        const coins = currentUser ? currentUser.coins : 0;
        
        const coinsElement = document.getElementById('user-coins');
        if (coinsElement) {
            coinsElement.textContent = coins.toLocaleString();
            
            // Add animation effect
            coinsElement.style.transform = 'scale(1.2)';
            coinsElement.style.color = '#ffd700';
            
            setTimeout(() => {
                coinsElement.style.transform = 'scale(1)';
                coinsElement.style.color = 'white';
            }, 300);
        }
    }

    addCoins(amount) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            currentUser.coins += amount;
            
            // Update user in storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].coins = currentUser.coins;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update current user in storage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            this.updateCoinsDisplay();
            this.showNotification(`+${amount} coins ajoutés !`, 'success');
        }
    }

    removeCoins(amount) {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.coins >= amount) {
            currentUser.coins -= amount;
            
            // Update user in storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].coins = currentUser.coins;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update current user in storage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            this.updateCoinsDisplay();
            return true;
        }
        return false;
    }

    getCoins() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.coins : 0;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 10px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize systems
const authSystem = new AuthSystem();
const coinsSystem = new CoinsSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthSystem, CoinsSystem };
}
