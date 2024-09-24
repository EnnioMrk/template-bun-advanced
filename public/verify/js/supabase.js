const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
    "https://bbqmbttgbwghvcoedszb.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicW1idHRnYndnaHZjb2Vkc3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk2NTM5OTcsImV4cCI6MTk4NTIyOTk5N30.m8bBPC6TyomyKlIV1GdXPjx4Rl7omnniocPsh5kWiFU"
);

//wait for state change
db.auth.onAuthStateChange((event, session) => {
    db.auth.getUser().then((user) => {
        if (user) {
            //set id cookie
            document.cookie = `id=${user.data.user.id}; path=/`;
            window.location.replace("/");
        }
    });
});
