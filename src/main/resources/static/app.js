const { useEffect, useMemo, useState } = React;

function App() {
    const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem("tourismAuth") || "null"));
    const [view, setView] = useState(() => authDefaultView(JSON.parse(localStorage.getItem("tourismAuth") || "null")));
    const [packages, setPackages] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [bookingDraft, setBookingDraft] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const isAdmin = auth?.role === "ADMIN";
    const headers = useMemo(() => ({
        "Content-Type": "application/json",
        ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {})
    }), [auth]);

    async function request(path, options = {}) {
        const response = await fetch(path, {
            ...options,
            headers: { ...headers, ...(options.headers || {}) }
        });
        if (!response.ok) {
            let detail = "Request failed";
            try {
                detail = (await response.json()).message || detail;
            } catch (ignored) {
                detail = response.statusText;
            }
            throw new Error(detail);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    async function loadCatalog() {
        const [packageData, hotelData, vehicleData] = await Promise.all([
            request("/api/packages"),
            request("/api/hotels"),
            request("/api/vehicles")
        ]);
        setPackages(packageData || []);
        setHotels(hotelData || []);
        setVehicles(vehicleData || []);
    }

    async function loadBookings() {
        if (!auth?.userId) return;
        const path = isAdmin ? "/api/bookings" : `/api/bookings/user/${auth.userId}`;
        setBookings(await request(path) || []);
    }

    async function loadDashboard() {
        if (!isAdmin) return;
        setDashboard(await request("/api/admin/dashboard"));
    }

    useEffect(() => {
        loadCatalog().catch(showError);
    }, []);

    useEffect(() => {
        loadBookings().catch(showError);
        loadDashboard().catch(showError);
    }, [auth]);

    function authDefaultView(currentAuth) {
        if (!currentAuth) return "landing";
        return currentAuth.role === "ADMIN" ? "admin" : "customer";
    }

    function navigate(nextView) {
        setError("");
        setMessage("");
        setView(nextView);
    }

    function saveAuth(nextAuth) {
        setAuth(nextAuth);
        localStorage.setItem("tourismAuth", JSON.stringify(nextAuth));
        setView(nextAuth.role === "ADMIN" ? "admin" : "customer");
        flash(`Welcome, ${nextAuth.name}.`);
    }

    function logout() {
        setAuth(null);
        localStorage.removeItem("tourismAuth");
        setBookings([]);
        setDashboard(null);
        navigate("landing");
    }

    function flash(text) {
        setError("");
        setMessage(text);
        window.setTimeout(() => setMessage(""), 3200);
    }

    function showError(err) {
        setMessage("");
        setError(err.message || "Something went wrong");
    }

    async function bookPackage(tourPackage) {
        if (!auth) {
            navigate("login");
            showError(new Error("Please login before booking."));
            return;
        }
        setBookingDraft(tourPackage);
        setView("booking");
    }

    async function submitBooking(event) {
        event.preventDefault();
        if (!bookingDraft) return;
        const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
        await request("/api/bookings", {
            method: "POST",
            body: JSON.stringify({
                ...payload,
                userId: auth.userId,
                packageId: bookingDraft.id,
                hotelId: payload.hotelId ? Number(payload.hotelId) : null,
                vehicleId: payload.vehicleId ? Number(payload.vehicleId) : null,
                numberOfPeople: payload.numberOfPeople ? Number(payload.numberOfPeople) : 1
            })
        });
        setBookingDraft(null);
        flash("Booking request sent. Admin approval is pending.");
        await loadBookings();
        setView(auth.role === "ADMIN" ? "admin" : "customer");
    }

    async function updateBookingStatus(id, status) {
        await request(`/api/bookings/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status })
        });
        flash(status === "CONFIRMED" ? "Booking approved." : "Booking cancelled.");
        await loadBookings();
        await loadDashboard();
    }

    async function createPackage(event) {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
        await request("/api/packages", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        event.currentTarget.reset();
        flash("Package added.");
        await loadCatalog();
        await loadDashboard();
    }

    return React.createElement("div", { className: "app-shell" },
        React.createElement(Header, { auth, view, navigate, logout }),
        message && React.createElement("div", { className: "toast" }, message),
        error && React.createElement("div", { className: "toast error" }, error),
        view === "landing" && React.createElement(LandingPage, { navigate, packages }),
        view === "login" && React.createElement(AuthPage, { mode: "login", saveAuth, showError, navigate }),
        view === "signup" && React.createElement(AuthPage, { mode: "signup", saveAuth, showError, navigate }),
        view === "packages" && React.createElement(PackageSearchPage, { packages, bookPackage }),
        view === "booking" && React.createElement(BookingFormPage, { tourPackage: bookingDraft, hotels, vehicles, submitBooking, navigate }),
        view === "customer" && React.createElement(CustomerDashboard, { auth, packages, hotels, vehicles, bookings, bookPackage, navigate }),
        view === "admin" && isAdmin && React.createElement(AdminDashboard, { dashboard, packages, hotels, vehicles, bookings, createPackage, updateBookingStatus, navigate }),
        view === "admin" && !isAdmin && React.createElement(AuthPage, { mode: "login", saveAuth, showError, navigate }),
        React.createElement(Footer, { navigate })
    );
}

function Header({ auth, view, navigate, logout }) {
    const nav = [
        ["landing", "Home"],
        ["packages", "Packages"],
        ...(auth?.role === "CUSTOMER" ? [["customer", "Customer Dashboard"]] : []),
        ...(auth?.role === "ADMIN" ? [["admin", "Admin Dashboard"]] : [])
    ];

    return React.createElement("header", { className: "topbar" },
        React.createElement("div", { className: "topbar-inner" },
            React.createElement("button", { className: "brand-button", onClick: () => navigate("landing") },
                React.createElement("span", { className: "brand-mark" }, "OT"),
                React.createElement("span", { className: "brand-copy" },
                    React.createElement("strong", null, "Tourism Manager"),
                )
            ),
            React.createElement("nav", { className: "nav" },
                nav.map(([key, label]) => React.createElement("button", {
                    key,
                    className: view === key ? "active" : "",
                    onClick: () => navigate(key)
                }, label))
            ),
            React.createElement("div", { className: "top-actions" },
                auth
                    ? React.createElement(React.Fragment, null,
                        React.createElement("span", { className: "user-chip" }, `${auth.name} · ${auth.role}`),
                        React.createElement("button", { className: "secondary", onClick: logout }, "Logout")
                    )
                    : React.createElement(React.Fragment, null,
                        React.createElement("button", { className: "secondary", onClick: () => navigate("login") }, "Login"),
                        React.createElement("button", { onClick: () => navigate("signup") }, "Sign Up")
                    )
            )
        )
    );
}

function Footer({ navigate }) {
    return React.createElement("footer", { className: "site-footer" },
        React.createElement("div", { className: "footer-inner" },
            React.createElement("section", { className: "footer-brand" },
                React.createElement("div", { className: "brand-mark" }, "OT"),
                React.createElement("div", null,
                    React.createElement("h2", null, "Online Tourism Management System"),
                    React.createElement("p", null, "A secure Spring Boot and MySQL platform for package booking, hotel selection, vehicle booking, admin approval, and customer trip tracking.")
                )
            ),
            React.createElement("section", { className: "footer-column" },
                React.createElement("h3", null, "Explore"),
                React.createElement("button", { onClick: () => navigate("landing") }, "Home"),
                React.createElement("button", { onClick: () => navigate("packages") }, "Packages"),
                React.createElement("button", { onClick: () => navigate("login") }, "Login")
            ),
            React.createElement("section", { className: "footer-column" },
                React.createElement("h3", null, "Services"),
                React.createElement("span", null, "Domestic Tourism"),
                React.createElement("span", null, "International Tours"),
                React.createElement("span", null, "Hotels & Vehicles")
            ),
            React.createElement("section", { className: "footer-column" },
                React.createElement("h3", null, "Project Stack"),
                React.createElement("span", null, "Spring Boot REST API"),
                React.createElement("span", null, "JWT Security"),
                React.createElement("span", null, "MySQL + JPA")
            )
        ),
        React.createElement("div", { className: "footer-bottom" },
            React.createElement("span", null, "Fortune Cloud Technologies"),
            React.createElement("span", null, "Admin approval workflow enabled"),
            React.createElement("span", null, "Customer map view after confirmation")
        )
    );
}

function LandingPage({ navigate, packages }) {
    function searchFromHero(event) {
        event.preventDefault();
        navigate("packages");
    }

    return React.createElement(React.Fragment, null,
        React.createElement("section", { className: "landing-hero luxury-hero" },
            React.createElement("div", { className: "hero-content" },
                React.createElement("h1", null,
                    "Discover Your Next ",
                    React.createElement("span", null, "Adventure")
                ),
                React.createElement("p", null, "Explore breathtaking destinations with curated travel packages, comfortable hotels, vehicle booking, and seamless admin-approved trip planning."),
                React.createElement("form", { className: "hero-search", onSubmit: searchFromHero },
                    React.createElement("label", null,
                        React.createElement("span", null, "Location"),
                        React.createElement("input", { type: "text", placeholder: "Where to?" })
                    ),
                    React.createElement("label", null,
                        React.createElement("span", null, "Date"),
                        React.createElement("input", { type: "text", placeholder: "When?" })
                    ),
                    React.createElement("label", null,
                        React.createElement("span", null, "Guests"),
                        React.createElement("input", { type: "text", placeholder: "Guests" })
                    ),
                    React.createElement("button", null, "Search")
                )
            )
        ),
        React.createElement("section", { className: "landing-stats" },
            React.createElement("div", { className: "stats-inner" },
                React.createElement(Metric, { value: "500+", label: "Destinations" }),
                React.createElement(Metric, { value: "10K+", label: "Happy Travelers" }),
                React.createElement(Metric, { value: "200+", label: "Hotels" }),
                React.createElement(Metric, { value: "4.9", label: "Average Rating" })
            )
        ),
        React.createElement("main", { className: "landing-sections" },
            React.createElement("section", { className: "showcase-section" },
                React.createElement("div", { className: "section-heading" },
                    React.createElement("h2", null,
                        "Popular ",
                        React.createElement("span", null, "Tour Packages")
                    ),
                    React.createElement("p", null, "Handpicked destinations with the best experiences, accommodations, and guided tours.")
                ),
                React.createElement(PackageGrid, { packages: packages.slice(0, 4), bookPackage: () => navigate("packages") }),
                React.createElement("div", { className: "center-action" },
                    React.createElement("button", { className: "secondary outline", onClick: () => navigate("packages") }, "View All Packages")
                )
            ),
            React.createElement(FeaturedHotels, { navigate }),
            React.createElement("section", { className: "cta-section" },
                React.createElement("div", { className: "cta-card" },
                    React.createElement("h2", null, "Ready for Your Next Trip?"),
                    React.createElement("p", null, "Join happy travelers. Sign up today and send your first booking request for admin approval."),
                    React.createElement("div", { className: "hero-actions" },
                        React.createElement("button", { onClick: () => navigate("signup") }, "Get Started Free"),
                        React.createElement("button", { className: "secondary ghost", onClick: () => navigate("packages") }, "Browse Packages")
                    )
                )
            )
        )
    );
}

function FeaturedHotels({ navigate }) {
    const hotels = [
        { name: "Ocean View Resort", location: "Goa", price: 3500, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80" },
        { name: "Backwater Pearl Houseboat", location: "Kerala", price: 6200, image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80" },
        { name: "Desert Star Hotel", location: "Dubai", price: 8500, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80" }
    ];

    return React.createElement("section", { className: "hotel-showcase" },
        React.createElement("div", { className: "showcase-section" },
            React.createElement("div", { className: "section-heading" },
                React.createElement("h2", null,
                    "Featured ",
                    React.createElement("span", null, "Hotels")
                ),
                React.createElement("p", null, "Stay at comfortable hotels with package-ready transport and premium amenities.")
            ),
            React.createElement("div", { className: "hotel-grid" },
                hotels.map(hotel => React.createElement("article", { className: "hotel-card", key: hotel.name },
                    React.createElement("div", { className: "hotel-image", style: { backgroundImage: `url("${hotel.image}")` } }),
                    React.createElement("div", { className: "hotel-body" },
                        React.createElement("h3", null, hotel.name),
                        React.createElement("p", null, hotel.location),
                        React.createElement("strong", null, `Rs. ${hotel.price} / night`)
                    )
                ))
            ),
            React.createElement("div", { className: "center-action" },
                React.createElement("button", { className: "secondary outline", onClick: () => navigate("packages") }, "View Hotels With Booking")
            )
        )
    );
}

function Metric({ value, label }) {
    return React.createElement("div", { className: "metric" },
        React.createElement("strong", null, value),
        React.createElement("span", null, label)
    );
}

function Feature({ title, text }) {
    return React.createElement("article", { className: "feature" },
        React.createElement("h3", null, title),
        React.createElement("p", null, text)
    );
}

function AuthPage({ mode, saveAuth, showError, navigate }) {
    const isSignup = mode === "signup";

    async function submit(event) {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
        if (payload.role === "") delete payload.role;
        try {
            const response = await fetch(`/api/auth/${isSignup ? "register" : "login"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error((await response.json()).message || "Authentication failed");
            saveAuth(await response.json());
        } catch (err) {
            showError(err);
        }
    }

    return React.createElement("main", { className: "auth-page" },
        React.createElement("section", { className: "auth-visual" },
            React.createElement("h2", null, isSignup ? "Create your travel account" : "Welcome back"),
            React.createElement("p", null, isSignup ? "Register as a customer and start booking tour packages instantly." : "Login as admin or customer to access your dashboard.")
        ),
        React.createElement("section", { className: "auth-panel" },
            React.createElement("h1", null, isSignup ? "Sign Up" : "Login"),
            React.createElement("form", { className: "form-grid", onSubmit: submit },
                isSignup && React.createElement("label", null, "Full Name", React.createElement("input", { name: "name", required: true, placeholder: "Your name" })),
                React.createElement("label", null, "Email", React.createElement("input", { name: "email", type: "email", required: true, defaultValue: isSignup ? "" : "admin@tourism.com" })),
                React.createElement("label", null, "Password", React.createElement("input", { name: "password", type: "password", required: true, defaultValue: isSignup ? "" : "admin123" })),
                isSignup && React.createElement("label", null, "Phone", React.createElement("input", { name: "phone", placeholder: "Mobile number" })),
                isSignup && React.createElement("label", null, "Account Type", React.createElement("select", { name: "role", defaultValue: "" },
                    React.createElement("option", { value: "" }, "Customer"),
                    React.createElement("option", { value: "ADMIN" }, "Admin")
                )),
                React.createElement("button", null, isSignup ? "Create Account" : "Login")
            ),
            React.createElement("p", { className: "switch-auth" },
                isSignup ? "Already registered? " : "New customer? ",
                React.createElement("button", { className: "link-button", onClick: () => navigate(isSignup ? "login" : "signup") }, isSignup ? "Login" : "Create account")
            )
        )
    );
}

function PackageSearchPage({ packages, bookPackage }) {
    const [filters, setFilters] = useState({ q: "", destination: "", minPrice: "", maxPrice: "", duration: "" });
    const destinations = [...new Set(packages.map(item => item.destination).filter(Boolean))];

    const filtered = packages.filter(item => {
        const q = filters.q.toLowerCase();
        const price = Number(item.price || 0);
        return (!q || `${item.name} ${item.destination} ${item.description}`.toLowerCase().includes(q))
            && (!filters.destination || item.destination === filters.destination)
            && (!filters.minPrice || price >= Number(filters.minPrice))
            && (!filters.maxPrice || price <= Number(filters.maxPrice))
            && (!filters.duration || String(item.duration || "").toLowerCase().includes(filters.duration.toLowerCase()));
    });

    function update(name, value) {
        setFilters(prev => ({ ...prev, [name]: value }));
    }

    return React.createElement("main", { className: "container page-stack" },
        React.createElement("section", { className: "page-heading" },
            React.createElement("h1", null, "Search Tour Packages"),
            React.createElement("p", null, "Filter by destination, budget, duration, and keywords.")
        ),
        React.createElement("section", { className: "filter-panel" },
            React.createElement("label", null, "Search", React.createElement("input", { value: filters.q, onChange: e => update("q", e.target.value), placeholder: "Goa, beach, Dubai..." })),
            React.createElement("label", null, "Destination", React.createElement("select", { value: filters.destination, onChange: e => update("destination", e.target.value) },
                React.createElement("option", { value: "" }, "All destinations"),
                destinations.map(destination => React.createElement("option", { key: destination, value: destination }, destination))
            )),
            React.createElement("label", null, "Min Price", React.createElement("input", { type: "number", value: filters.minPrice, onChange: e => update("minPrice", e.target.value), min: "0" })),
            React.createElement("label", null, "Max Price", React.createElement("input", { type: "number", value: filters.maxPrice, onChange: e => update("maxPrice", e.target.value), min: "0" })),
            React.createElement("label", null, "Duration", React.createElement("input", { value: filters.duration, onChange: e => update("duration", e.target.value), placeholder: "4 Days" })),
            React.createElement("button", { className: "secondary", onClick: () => setFilters({ q: "", destination: "", minPrice: "", maxPrice: "", duration: "" }) }, "Clear")
        ),
        React.createElement("div", { className: "result-count" }, `${filtered.length} package(s) found`),
        React.createElement(PackageGrid, { packages: filtered, bookPackage })
    );
}

function PackageGrid({ packages, bookPackage }) {
    if (!packages.length) {
        return React.createElement("section", { className: "empty-state" },
            React.createElement("h3", null, "No packages found"),
            React.createElement("p", null, "Try changing your filters or add more packages from the admin dashboard.")
        );
    }

    return React.createElement("section", { className: "grid" },
        packages.map(item => React.createElement("article", { className: "package-card", key: item.id },
            React.createElement("div", {
                className: "package-media",
                style: { backgroundImage: `linear-gradient(0deg, rgba(12, 46, 51, 0.8), rgba(12, 46, 51, 0.06)), url("${packageImage(item)}")` }
            },
                React.createElement("span", null, item.destination || "Tour")
            ),
            React.createElement("div", { className: "package-body" },
                React.createElement("h3", null, item.name),
                React.createElement("p", null, `${item.destination || "Destination"} | ${item.duration || "Flexible duration"}`),
                React.createElement("p", null, item.description || "Tour package with hotel and transport options."),
                React.createElement("div", { className: "card-footer" },
                    React.createElement("span", { className: "price" }, `Rs. ${item.price || 0}`),
                    React.createElement("button", { onClick: () => bookPackage(item) }, "Book")
                )
            )
        ))
    );
}

function packageImage(item) {
    return item.imageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80";
}

function BookingFormPage({ tourPackage, hotels, vehicles, submitBooking, navigate }) {
    if (!tourPackage) {
        return React.createElement("main", { className: "container page-stack" },
            React.createElement("section", { className: "empty-state" },
                React.createElement("h3", null, "No package selected"),
                React.createElement("p", null, "Choose a package before filling booking details."),
                React.createElement("button", { onClick: () => navigate("packages") }, "Browse Packages")
            )
        );
    }

    return React.createElement("main", { className: "container booking-layout" },
        React.createElement("section", { className: "booking-summary" },
            React.createElement("div", {
                className: "booking-image",
                style: { backgroundImage: `linear-gradient(0deg, rgba(12, 46, 51, 0.76), rgba(12, 46, 51, 0.08)), url("${packageImage(tourPackage)}")` }
            },
                React.createElement("span", null, tourPackage.destination)
            ),
            React.createElement("div", { className: "booking-copy" },
                React.createElement("span", { className: "eyebrow dark" }, "Booking Request"),
                React.createElement("h1", null, tourPackage.name),
                React.createElement("p", null, tourPackage.description),
                React.createElement("strong", { className: "price" }, `Rs. ${tourPackage.price || 0} | ${tourPackage.duration || "Flexible duration"}`)
            )
        ),
        React.createElement("section", { className: "auth-panel" },
            React.createElement("h2", null, "Traveller Details"),
            React.createElement("form", { className: "form-grid", onSubmit: submitBooking },
                React.createElement("label", null, "Your Current Location", React.createElement("input", { name: "currentLocation", required: true, placeholder: "Example: Bengaluru, Karnataka" })),
                React.createElement("label", null, "Number of People", React.createElement("input", { name: "numberOfPeople", type: "number", min: "1", defaultValue: "1", required: true })),
                React.createElement("label", null, "Select Hotel", React.createElement("select", { name: "hotelId", required: true },
                    React.createElement("option", { value: "" }, "Choose hotel"),
                    hotels.map(hotel => React.createElement("option", { key: hotel.id, value: hotel.id }, `${hotel.name} - ${hotel.location} - Rs. ${hotel.price || 0}`))
                )),
                React.createElement("label", null, "Select Vehicle", React.createElement("select", { name: "vehicleId", required: true },
                    React.createElement("option", { value: "" }, "Choose vehicle"),
                    vehicles.map(vehicle => React.createElement("option", { key: vehicle.id, value: vehicle.id }, `${vehicle.name} - ${vehicle.type} - Rs. ${vehicle.price || 0}`))
                )),
                React.createElement("label", null, "Extra Note", React.createElement("textarea", { name: "customerNote", rows: 4, placeholder: "Pickup timing, special request, senior citizens, children, etc." })),
                React.createElement("div", { className: "row-actions" },
                    React.createElement("button", null, "Submit Booking Request"),
                    React.createElement("button", { type: "button", className: "secondary", onClick: () => navigate("packages") }, "Cancel")
                )
            )
        )
    );
}

function CustomerDashboard({ auth, packages, hotels, vehicles, bookings, bookPackage, navigate }) {
    return React.createElement("main", { className: "container page-stack" },
        React.createElement("section", { className: "dashboard-head" },
            React.createElement("div", null,
                React.createElement("span", { className: "eyebrow dark" }, "Customer Dashboard"),
                React.createElement("h1", null, `Hello, ${auth?.name || "Customer"}`),
                React.createElement("p", null, "Manage bookings, explore packages, and review hotel and transport options.")
            ),
            React.createElement("button", { onClick: () => navigate("packages") }, "Search More Packages")
        ),
        React.createElement("section", { className: "metric-band" },
            React.createElement(Metric, { value: bookings.length, label: "Bookings" }),
            React.createElement(Metric, { value: packages.length, label: "Packages" }),
            React.createElement(Metric, { value: hotels.length, label: "Hotels" }),
            React.createElement(Metric, { value: vehicles.length, label: "Vehicles" })
        ),
        React.createElement("section", { className: "split-layout" },
            React.createElement("div", { className: "panel" },
                React.createElement("h2", null, "Recommended Packages"),
                React.createElement(PackageGrid, { packages: packages.slice(0, 3), bookPackage })
            ),
            React.createElement("aside", { className: "panel" },
                React.createElement("h2", null, "Available Services"),
                React.createElement(ServiceList, { title: "Hotels", items: hotels, nameKey: "name", subKey: "location" }),
                React.createElement(ServiceList, { title: "Vehicles", items: vehicles, nameKey: "name", subKey: "type" })
            )
        ),
        React.createElement(BookingHistory, { bookings, showMap: true }),
        React.createElement(ConfirmedTourMaps, { bookings })
    );
}

function ConfirmedTourMaps({ bookings }) {
    const confirmed = bookings.filter(booking => booking.status === "CONFIRMED" && booking.tourPackage?.destination);
    if (!confirmed.length) {
        return React.createElement("section", { className: "panel" },
            React.createElement("h2", null, "Tour Location Maps"),
            React.createElement("p", { className: "muted" }, "Maps will appear here after admin approves your booking.")
        );
    }

    return React.createElement("section", { className: "panel" },
        React.createElement("h2", null, "Tour Location Maps"),
        React.createElement("div", { className: "map-grid" },
            confirmed.map(booking => React.createElement("article", { className: "map-card", key: `map-${booking.id}` },
                React.createElement("h3", null, booking.tourPackage.name),
                React.createElement("p", null, `${booking.currentLocation || "Your location"} to ${booking.tourPackage.destination}`),
                React.createElement("iframe", {
                    title: `${booking.tourPackage.destination} map`,
                    loading: "lazy",
                    src: mapEmbedUrl(booking.tourPackage.destination)
                })
            ))
        )
    );
}

function AdminDashboard({ dashboard, packages, hotels, vehicles, bookings, createPackage, updateBookingStatus, navigate }) {
    return React.createElement("main", { className: "container page-stack" },
        React.createElement("section", { className: "dashboard-head admin" },
            React.createElement("div", null,
                React.createElement("span", { className: "eyebrow dark" }, "Admin Dashboard"),
                React.createElement("h1", null, "System Control Center"),
                React.createElement("p", null, "Manage package inventory, monitor bookings, and review operational data.")
            ),
            React.createElement("button", { onClick: () => navigate("packages") }, "View Public Packages")
        ),
        React.createElement("section", { className: "metric-band" },
            Object.entries(dashboard || { users: 0, bookings: bookings.length, packages: packages.length, hotels: hotels.length, vehicles: vehicles.length })
                .map(([key, value]) => React.createElement(Metric, { key, value, label: key }))
        ),
        React.createElement("section", { className: "split-layout" },
            React.createElement("div", { className: "panel" },
                React.createElement("h2", null, "Add New Package"),
                React.createElement("form", { className: "form-grid package-form", onSubmit: createPackage },
                    React.createElement("label", null, "Package Name", React.createElement("input", { name: "name", required: true })),
                    React.createElement("label", null, "Destination", React.createElement("input", { name: "destination", required: true })),
                    React.createElement("label", null, "Price", React.createElement("input", { name: "price", type: "number", min: "0", step: "0.01" })),
                    React.createElement("label", null, "Duration", React.createElement("input", { name: "duration", placeholder: "5 Days / 4 Nights" })),
                    React.createElement("label", { className: "full" }, "Image URL", React.createElement("input", { name: "imageUrl", type: "url", placeholder: "https://images.unsplash.com/..." })),
                    React.createElement("label", { className: "full" }, "Description", React.createElement("textarea", { name: "description", rows: 4 })),
                    React.createElement("button", null, "Save Package")
                )
            ),
            React.createElement("aside", { className: "panel" },
                React.createElement("h2", null, "Current Inventory"),
                React.createElement(ServiceList, { title: "Packages", items: packages, nameKey: "name", subKey: "destination" }),
                React.createElement(ServiceList, { title: "Hotels", items: hotels, nameKey: "name", subKey: "location" }),
                React.createElement(ServiceList, { title: "Vehicles", items: vehicles, nameKey: "name", subKey: "type" })
            )
        ),
        React.createElement(AdminBookingApprovals, { bookings, updateBookingStatus })
    );
}

function AdminBookingApprovals({ bookings, updateBookingStatus }) {
    return React.createElement("section", { className: "panel" },
        React.createElement("h2", null, "Orders & Booking Approvals"),
        React.createElement("div", { className: "table-wrap" },
            React.createElement("table", null,
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "ID"),
                        React.createElement("th", null, "Customer"),
                        React.createElement("th", null, "Package"),
                        React.createElement("th", null, "Current Location"),
                        React.createElement("th", null, "People"),
                        React.createElement("th", null, "Hotel"),
                        React.createElement("th", null, "Vehicle"),
                        React.createElement("th", null, "Note"),
                        React.createElement("th", null, "Status"),
                        React.createElement("th", null, "Date"),
                        React.createElement("th", null, "Action")
                    )
                ),
                React.createElement("tbody", null,
                    bookings.length
                        ? bookings.map(booking => React.createElement("tr", { key: booking.id },
                            React.createElement("td", null, booking.id),
                            React.createElement("td", null, booking.user?.name || "-"),
                            React.createElement("td", null, booking.tourPackage?.name || "-"),
                            React.createElement("td", null, booking.currentLocation || "-"),
                            React.createElement("td", null, booking.numberOfPeople || "-"),
                            React.createElement("td", null, booking.hotel?.name || "-"),
                            React.createElement("td", null, booking.vehicle?.name || "-"),
                            React.createElement("td", null, booking.customerNote || "-"),
                            React.createElement("td", null, React.createElement("span", { className: `status ${booking.status.toLowerCase()}` }, booking.status)),
                            React.createElement("td", null, booking.bookingDate?.replace("T", " ").slice(0, 16)),
                            React.createElement("td", null,
                                booking.status === "PENDING"
                                    ? React.createElement("div", { className: "row-actions" },
                                        React.createElement("button", { onClick: () => updateBookingStatus(booking.id, "CONFIRMED") }, "Approve"),
                                        React.createElement("button", { className: "danger", onClick: () => updateBookingStatus(booking.id, "CANCELLED") }, "Cancel")
                                    )
                                    : "-"
                            )
                        ))
                        : React.createElement("tr", null,
                            React.createElement("td", { colSpan: 11 }, "No bookings yet.")
                        )
                )
            )
        )
    );
}

function ServiceList({ title, items, nameKey, subKey }) {
    return React.createElement("div", { className: "service-list" },
        React.createElement("h3", null, title),
        items.slice(0, 5).map(item => React.createElement("div", { className: "service-item", key: `${title}-${item.id}` },
            React.createElement("strong", null, item[nameKey]),
            React.createElement("span", null, item[subKey] || `Rs. ${item.price || 0}`)
        ))
    );
}

function BookingHistory({ bookings, showMap = false }) {
    return React.createElement("section", { className: "panel" },
        React.createElement("h2", null, "Booking History"),
        React.createElement("div", { className: "table-wrap" },
            React.createElement("table", null,
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "ID"),
                        React.createElement("th", null, "Package"),
                        React.createElement("th", null, "Hotel"),
                        React.createElement("th", null, "Vehicle"),
                        React.createElement("th", null, "People"),
                        React.createElement("th", null, "From"),
                        React.createElement("th", null, "Status"),
                        React.createElement("th", null, "Date"),
                        showMap && React.createElement("th", null, "Tour Map")
                    )
                ),
                React.createElement("tbody", null,
                    bookings.length
                        ? bookings.map(booking => React.createElement("tr", { key: booking.id },
                            React.createElement("td", null, booking.id),
                            React.createElement("td", null, booking.tourPackage?.name || "-"),
                            React.createElement("td", null, booking.hotel?.name || "-"),
                            React.createElement("td", null, booking.vehicle?.name || "-"),
                            React.createElement("td", null, booking.numberOfPeople || "-"),
                            React.createElement("td", null, booking.currentLocation || "-"),
                            React.createElement("td", null, React.createElement("span", { className: `status ${booking.status.toLowerCase()}` }, booking.status)),
                            React.createElement("td", null, booking.bookingDate?.replace("T", " ").slice(0, 16)),
                            showMap && React.createElement("td", null,
                                booking.status === "CONFIRMED" && booking.tourPackage?.destination
                                    ? React.createElement("a", { href: mapUrl(booking.tourPackage.destination), target: "_blank", rel: "noreferrer" }, "View Map")
                                    : "After approval"
                            )
                        ))
                        : React.createElement("tr", null,
                            React.createElement("td", { colSpan: showMap ? 9 : 8 }, "No bookings yet.")
                        )
                )
            )
        )
    );
}

function mapUrl(destination) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

function mapEmbedUrl(destination) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`;
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
