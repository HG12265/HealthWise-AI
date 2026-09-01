import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AITools.css";

// 11 AI Tools definition with detailed information
const TOOLS_DATA = [
    {
        id: "myfitnesspal",
        name: "MyFitnessPal",
        category: "AI Nutrition & Food Tracking",
        description: "AI-assisted nutrition coaching, food logging, meal scanning, calorie tracking, and macro tracking.",
        url: "https://www.myfitnesspal.com/",
        filters: ["Nutrition Tracking"],
        detailedInfo: {
            features: [
                "Barcode scanning for instant food logging",
                "AI-powered meal recognition",
                "Personalized nutrition coaching",
                "Real-time calorie and macro tracking",
                "Integration with fitness trackers",
                "Goal-based dietary recommendations"
            ],
            benefits: [
                "Track thousands of food items from database",
                "Monitor daily nutritional intake",
                "Set personalized health goals",
                "Analyze eating patterns over time",
                "Get AI-powered health insights",
                "Sync with popular fitness devices"
            ],
            use_cases: "Perfect for weight loss, fitness goals, calorie counting, and comprehensive nutrition monitoring",
            best_for: "People interested in detailed calorie tracking, athletes, and fitness enthusiasts"
        }
    },
    {
        id: "cronometer",
        name: "Cronometer",
        category: "Nutrient Analysis",
        description: "Detailed macro and micronutrient tracking, food logging, nutrition analysis, and dietary monitoring.",
        url: "https://cronometer.com/",
        filters: ["Nutrition Tracking"],
        detailedInfo: {
            features: [
                "Comprehensive micronutrient tracking (vitamins, minerals)",
                "Detailed macro tracking (proteins, fats, carbs)",
                "Extensive food database with 500,000+ items",
                "Personalized nutrition analysis",
                "Support for specialized diets (vegan, keto, etc.)",
                "Advanced reporting features"
            ],
            benefits: [
                "Ensure you meet all nutritional requirements",
                "Identify nutrient deficiencies",
                "Track specific vitamins and minerals",
                "Detailed health insights",
                "Better dietary planning",
                "Evidence-based nutrition tracking"
            ],
            use_cases: "Ideal for medical conditions, specialized diets, nutritional deficiency prevention, and health optimization",
            best_for: "Health-conscious users, people with dietary restrictions, athletes, and those managing health conditions"
        }
    },
    {
        id: "foodvisor",
        name: "Foodvisor",
        category: "Food Analysis",
        description: "AI-based food and meal analysis with nutrition tracking.",
        url: "https://www.foodvisor.io/",
        filters: ["Food Analysis", "Nutrition Tracking"],
        detailedInfo: {
            features: [
                "AI photo recognition for meals",
                "Automatic portion size estimation",
                "Nutritional breakdown analysis",
                "Easy meal logging via photos",
                "Personalized meal recommendations",
                "Calorie and macro tracking"
            ],
            benefits: [
                "Quick and effortless food logging",
                "Accurate portion estimation",
                "Visual meal tracking",
                "Instant nutritional insights",
                "No manual data entry needed",
                "Real-time nutrition feedback"
            ],
            use_cases: "Fast meal logging, visual food tracking, portion control, and quick nutritional analysis",
            best_for: "Busy individuals who prefer visual tracking, people wanting quick meal analysis, and casual food loggers"
        }
    },
    {
        id: "zoe",
        name: "ZOE",
        category: "Personalized Nutrition",
        description: "Personalized nutrition and gut-health insights supported by nutrition research.",
        url: "https://zoe.com/",
        filters: ["Personalized Nutrition", "Nutrition Tracking"],
        detailedInfo: {
            features: [
                "Scientific blood sugar response testing",
                "Gut microbiome analysis",
                "Personalized food recommendations",
                "Blood fat response measurement",
                "AI-powered meal planning",
                "Research-backed nutritional science"
            ],
            benefits: [
                "Understand your unique nutritional needs",
                "Optimize gut health",
                "Improve metabolic health",
                "Personalized food scores",
                "Evidence-based recommendations",
                "Long-term health optimization"
            ],
            use_cases: "Personalized nutrition planning, gut health optimization, metabolic health improvement, and preventive healthcare",
            best_for: "Health-optimizing individuals, those interested in personalized nutrition, and people focused on preventive health"
        }
    },
    {
        id: "nutriscan",
        name: "NutriScan",
        category: "AI Meal Planning",
        description: "Meal logging, nutrition goals, and personalized meal-planning assistance.",
        url: "https://nutriscan.app",
        filters: ["Meal Planning"],
        detailedInfo: {
            features: [
                "Quick meal logging",
                "Personalized meal planning",
                "Nutrition goal setting",
                "Weekly menu suggestions",
                "Shopping list generation",
                "Nutritional balance tracking"
            ],
            benefits: [
                "Plan meals aligned with health goals",
                "Automatic shopping list creation",
                "Ensure balanced nutrition",
                "Save time on meal planning",
                "Variety in daily meals",
                "Goal-oriented meal suggestions"
            ],
            use_cases: "Weekly meal planning, nutrition goal achievement, grocery shopping, and dietary management",
            best_for: "Busy professionals, families, meal planners, and people managing specific nutrition goals"
        }
    },
    {
        id: "nutritio",
        name: "Nutritio",
        category: "Dietitian AI",
        description: "AI-assisted nutrition planning and nutrition analysis for dietary workflows.",
        url: "https://nutritioapp.com/",
        filters: ["Meal Planning"],
        detailedInfo: {
            features: [
                "AI dietitian consultation",
                "Personalized nutrition plans",
                "Food composition analysis",
                "Dietary workflow management",
                "Professional nutrition guidance",
                "Health condition-specific diets"
            ],
            benefits: [
                "Professional nutrition guidance without cost",
                "Customized meal plans",
                "Condition-specific recommendations",
                "Dietitian-level analysis",
                "Comprehensive nutrition planning",
                "Evidence-based approach"
            ],
            use_cases: "Medical diet management, professional nutrition guidance, health condition management, and personalized planning",
            best_for: "People with health conditions, those needing professional nutrition guidance, and serious health optimizers"
        }
    },
    {
        id: "nutrinexa",
        name: "Nutrinexa",
        category: "Indian Dietetics AI",
        description: "Indian-focused nutrition planning and dietary workflow assistance.",
        url: "https://nutrinexa.in/",
        filters: ["Indian Nutrition", "Meal Planning"],
        detailedInfo: {
            features: [
                "Indian food database",
                "Regional recipe support",
                "Cultural dietary preferences",
                "Meal planning for Indian diets",
                "Regional spice and ingredient tracking",
                "Ayurvedic nutrition principles"
            ],
            benefits: [
                "Personalized Indian nutrition plans",
                "Cultural food preferences respected",
                "Regional recipe availability",
                "Better food relevance",
                "Authentic Indian meal planning",
                "Integration with local food culture"
            ],
            use_cases: "Indian meal planning, cultural nutrition management, regional recipe planning, and traditional diet optimization",
            best_for: "Indian population, people following traditional diets, and those preferring local and regional foods"
        }
    },
    {
        id: "mealstack",
        name: "MealStack",
        category: "Indian Dietitian AI",
        description: "Indian-food meal planning and nutrition tracking.",
        url: "https://www.mealstack.io",
        filters: ["Indian Nutrition", "Meal Planning"],
        detailedInfo: {
            features: [
                "Indian meal database",
                "Regional cuisine support",
                "Nutritional analysis of Indian foods",
                "Weekly Indian meal plans",
                "Macro tracking for traditional meals",
                "Local ingredient integration"
            ],
            benefits: [
                "Track Indian traditional meals accurately",
                "Culturally relevant meal planning",
                "Regional food preferences",
                "Authentic nutrition tracking",
                "Better dietary adherence",
                "Local food integration"
            ],
            use_cases: "Indian family meal planning, traditional diet tracking, regional nutrition management, and cultural diet optimization",
            best_for: "Indian families, traditional diet followers, and those wanting culturally-relevant nutrition tracking"
        }
    },
    {
        id: "fittrackai",
        name: "FitTrack AI",
        category: "Indian Nutrition AI",
        description: "Indian-food meal recognition and nutrition planning.",
        url: "https://fittrackai.in",
        filters: ["Indian Nutrition", "Nutrition Tracking"],
        detailedInfo: {
            features: [
                "AI recognition for Indian foods",
                "Photo-based meal logging for Indian cuisine",
                "Nutritional breakdown of Indian meals",
                "Personalized nutrition plans",
                "Regional food support",
                "Quick meal logging"
            ],
            benefits: [
                "Easy logging of Indian meals",
                "Accurate nutrition data for regional foods",
                "Visual meal tracking for Indian cuisine",
                "Culturally relevant insights",
                "Improved dietary tracking",
                "Better health management"
            ],
            use_cases: "Indian meal photo tracking, regional nutrition analysis, quick meal logging for traditional foods, fitness goals",
            best_for: "Indian population, fitness enthusiasts, traditional diet followers, and busy professionals in India"
        }
    },
    {
        id: "svas",
        name: "Svas",
        category: "Indian / Regional Nutrition",
        description: "Regional food logging and nutrition assistance.",
        url: null,
        filters: ["Indian Nutrition", "Nutrition Tracking"],
        detailedInfo: {
            features: [
                "Regional and local food database",
                "Cultural nutrition management",
                "Traditional meal tracking",
                "Regional ingredient support",
                "Personalized nutrition guidance",
                "Community-driven food database"
            ],
            benefits: [
                "Support for local and regional foods",
                "Cultural dietary preferences",
                "Better nutrition tracking accuracy",
                "Community food insights",
                "Improved adherence to healthy eating",
                "Culturally appropriate recommendations"
            ],
            use_cases: "Regional meal planning, traditional food tracking, cultural nutrition management, and community-based wellness",
            best_for: "People following regional diets, traditional food enthusiasts, and communities preferring local foods"
        }
    },
    {
        id: "vitesnap",
        name: "ViteSnap",
        category: "AI Meal Scanner",
        description: "AI meal-photo analysis with calorie, macro, micronutrient, and portion estimation.",
        url: "https://www.vitesnap.com/",
        filters: ["Food Analysis", "Nutrition Tracking"],
        detailedInfo: {
            features: [
                "Advanced food photo recognition",
                "Automated calorie estimation",
                "Macro breakdown (protein, carbs, fats)",
                "Micronutrient analysis",
                "Portion size estimation",
                "Batch photo processing"
            ],
            benefits: [
                "Instant comprehensive nutrition analysis",
                "Accurate calorie estimation from photos",
                "Complete nutritional profile",
                "Easy meal documentation",
                "No manual nutrient calculation",
                "Detailed health insights"
            ],
            use_cases: "Quick meal analysis, batch photo processing, comprehensive nutrition tracking, and detailed health monitoring",
            best_for: "People wanting quick and comprehensive meal analysis, photographers, and those tracking detailed nutrition"
        }
    }
];

// Helper to return a custom medical SVG icon based on category
const getCategoryIcon = (category) => {
    if (category.includes("Tracking") || category.includes("Analysis")) {
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        );
    }
    if (category.includes("Planning") || category.includes("Dietitian") || category.includes("Dietics")) {
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="currentColor" opacity="0.1" />
            </svg>
        );
    }
    if (category.includes("Scanner") || category.includes("Food Analysis")) {
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
        );
    }
    // Default Stethoscope/Shield
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
};

function AITools() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedTool, setSelectedTool] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = [
        "All",
        "Nutrition Tracking",
        "Food Analysis",
        "Meal Planning",
        "Personalized Nutrition",
        "Indian Nutrition"
    ];

    // Filter and search logic
    const filteredTools = TOOLS_DATA.filter((tool) => {
        const matchesFilter = activeFilter === "All" || tool.filters.includes(activeFilter);
        const matchesSearch =
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="ai-tools-page">
            <Navbar />

            {/* HERO HEADER */}
            <header className="ai-tools-hero">
                <div className="hero-glow-circle hero-glow-1"></div>
                <div className="hero-glow-circle hero-glow-2"></div>
                <div className="hero-container">
                    <span className="ai-tools-badge">
                        <span style={{ color: "#8B5CF6", marginRight: "4px" }}>✦</span> AI HEALTHCARE TOOLS
                    </span>
                    <h1 className="ai-tools-title">AI Nutrition & Dietetics Tools</h1>
                    <p className="ai-tools-subtitle">
                        Explore AI-powered tools for nutrition tracking, meal analysis, personalized nutrition, and dietary planning.
                    </p>
                    <div className="ai-tools-disclaimer">
                        <strong>Disclaimer:</strong> External tools are independently operated third-party services. HealthWise AI does not control or endorse their recommendations.
                    </div>
                </div>
            </header>

            {/* SEARCH AND FILTERS */}
            <section className="search-filter-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search AI tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-field"
                            aria-label="Search AI tools"
                        />
                    </div>
                </div>

                <div className="filters-wrapper">
                    <div className="filters-container">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`filter-btn ${activeFilter === cat ? "active" : ""}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* CARD GRID */}
            <main className="cards-grid-container">
                <div className="cards-grid">
                    {filteredTools.length > 0 ? (
                        filteredTools.map((tool) => (
                            <article key={tool.id} className={`tool-card ${!tool.url ? "disabled-card" : ""}`}>
                                <div className="tool-card-header">
                                    <div className="tool-icon-container">
                                        {getCategoryIcon(tool.category)}
                                    </div>
                                    <div className="tool-title-wrapper">
                                        <h3 className="tool-name-heading">{tool.name}</h3>
                                        <span className={`tool-category-label ${tool.filters.includes("Indian Nutrition") ? "indian-cat" : ""}`}>
                                            {tool.category}
                                        </span>
                                    </div>
                                </div>

                                <p className="tool-description-text">{tool.description}</p>

                                <hr className="tool-divider-line" />

                                <div className="tool-card-footer">
                                    <button
                                        onClick={() => {
                                            setSelectedTool(tool);
                                            setIsModalOpen(true);
                                        }}
                                        className="btn-secondary tool-button-link"
                                        title="View detailed information"
                                    >
                                        Learn More ℹ️
                                    </button>
                                    {tool.url ? (
                                        <a
                                            href={tool.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary tool-button-link"
                                        >
                                            Open Tool &rarr;
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="btn-primary tool-button-link disabled-btn"
                                        >
                                            Official link unavailable
                                        </button>
                                    )}

                                    <span className="tool-badge-external">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                                        </svg>
                                        External Tool
                                    </span>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="no-results-card">
                            <span className="no-results-icon">🔍</span>
                            <h3>No tools found matching your criteria</h3>
                            <p>Try adjusting your search query or switching filters.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* SAFETY NOTICE CARD */}
            <section className="safety-disclaimer-wrapper">
                <div className="safety-disclaimer-card">
                    <div className="safety-icon-container">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                        </svg>
                    </div>
                    <div className="safety-text-container">
                        <h4 className="safety-title">Important Notice</h4>
                        <p className="safety-desc">
                            These tools are third-party services and are provided for informational and educational purposes. HealthWise AI does not control their content, availability, pricing, privacy policies, or recommendations. Users should review each service's terms and privacy policy before using it.
                        </p>
                    </div>
                </div>
            </section>

            {/* DETAILED INFO MODAL */}
            {isModalOpen && selectedTool && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            ✕
                        </button>

                        <div className="modal-header">
                            <div className="modal-icon-container">
                                {getCategoryIcon(selectedTool.category)}
                            </div>
                            <div className="modal-title-section">
                                <h2 className="modal-tool-name">{selectedTool.name}</h2>
                                <p className="modal-tool-category">{selectedTool.category}</p>
                            </div>
                        </div>

                        <div className="modal-body">
                            {/* Features Section */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">🎯 Key Features</h3>
                                <ul className="modal-features-list">
                                    {selectedTool.detailedInfo.features.map((feature, idx) => (
                                        <li key={idx} className="modal-feature-item">
                                            <span className="feature-dot">•</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Benefits Section */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">✨ Benefits</h3>
                                <ul className="modal-benefits-list">
                                    {selectedTool.detailedInfo.benefits.map((benefit, idx) => (
                                        <li key={idx} className="modal-benefit-item">
                                            <span className="benefit-icon">✓</span>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Use Cases Section */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">💡 Use Cases</h3>
                                <p className="modal-use-case-text">{selectedTool.detailedInfo.use_cases}</p>
                            </div>

                            {/* Best For Section */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">👥 Best For</h3>
                                <p className="modal-best-for-text">{selectedTool.detailedInfo.best_for}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            {selectedTool.url ? (
                                <a
                                    href={selectedTool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary modal-action-btn"
                                >
                                    Visit Official Website →
                                </a>
                            ) : (
                                <button disabled className="btn-primary modal-action-btn disabled-btn">
                                    Official link unavailable
                                </button>
                            )}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="btn-secondary modal-action-btn"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default AITools;
