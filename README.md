# Pantry Pal Github Repository
🥘 PantryPal

Share your flavor with the world.

PantryPal is a modern social culinary platform built for home chefs. It allows users to discover recipes, follow talented creators, and manage their own digital cookbook. The application is designed with an "App-First" philosophy, utilizing high-performance modals and real-time state synchronization to provide a seamless user experience.
🚀 Features
👤 Social Engine

    Follow System: Follow/Unfollow chefs with real-time stat updates and persistent follow states.

    Interactive Feed: A "Fresh Feed" showing the latest community creations.

    Engagement Suite: Like posts, save recipes to private collections, and join the conversation in the "Chef's Table" comment section.

📖 Recipe Management

    Creator Pipeline: Share recipes with detailed ingredients, steps, and high-quality image previews.

    Gamification: Chefs earn +10 points for every recipe shared to encourage community growth.

    Full CRUD: Edit or delete your posts directly from your profile.

🔍 Advanced Discovery

    Dual-Search: Search for specific dishes by name/ingredients or find chefs by their @username.

    Global Sync: Actions taken in search results (like/save) reflect immediately across the entire site.

📱 Superior UX

    Mobile-Responsive: Optimized for all screen sizes with a sticky mobile bottom nav.

    Consolidated Profile: Manage your bio, photo, and username through an integrated modal—no page reloads required.

    Haptic UI: Visual feedback on every touch with smooth Tailwind transitions and Lucide icons.

🛠️ Tech Stack

    Frontend: HTML5, Tailwind CSS, JavaScript (ES6+), Lucide Icons.

    Backend: Node.js, Express.js.

    Database: MongoDB via Mongoose.

    Authentication: JWT (JSON Web Tokens) & Bcrypt.js.

📂 Architecture

The project follows a RESTful API structure:

    /api/auth: Handles user registration, login, profile updates, and the follow logic.

    /api/recipes: Manages recipe creation, global feed fetching, likes, saves, and comments.

⚙️ Installation & Setup

    Clone the repository:
    Bash

    git clone https://github.com/yourusername/PantryPal.git

    Install dependencies:
    Bash

    cd Backend
    npm install

    Configure Environment Variables:
    Create a .env file in the Backend folder:
    Code snippet

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    PORT=5000

    Run the server:
    Bash

    npm start

    Launch Frontend:
    Open index.html in your browser (or use Live Server in VS Code).

📝 License

This project is built for the July 2026 intake and is open for community contributions.

Chef of the Month is waiting for you. Get cooking! 👨‍🍳👩‍🍳
