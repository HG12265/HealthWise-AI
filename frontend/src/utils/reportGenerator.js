import { jsPDF } from "jspdf";

/**
 * Safely converts any value to a clean display string.
 */
function safeString(val, fallback = "Not available") {
    if (val === null || val === undefined) return fallback;
    const str = String(val).trim();
    if (str === "" || str === "null" || str === "undefined") return fallback;
    return str;
}

/**
 * Safely parses any array or list-like input.
 */
function safeArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(item => item !== null && item !== undefined && String(item).trim() !== "");
    if (typeof val === "string") {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        return val.split(",").map(s => s.trim()).filter(s => s !== "");
    }
    if (typeof val === "object") return Object.values(val).map(v => String(v));
    return [String(val)];
}

/**
 * Generates a clean, professional, print-ready PDF health assessment report
 * using the logged-in user's actual database health data, ML predictions,
 * and recommendations.
 *
 * @param {string} userName 
 * @param {string} userEmail 
 * @param {object} healthData 
 * @param {object} prediction 
 * @param {object} recommendations 
 */
export function generatePDFReport(userName, userEmail, healthData, prediction, recommendations) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2); // 180mm
    const maxUsableY = pageHeight - 20;

    let y = 20;

    // Helper: Ensure enough space on page or add a new page
    const checkSpace = (neededHeight) => {
        if (y + neededHeight > maxUsableY) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    };

    // Helper: Add Section Header
    const addSectionHeader = (title) => {
        checkSpace(16);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 58, 138); // #1E3A8A - Dark primary
        doc.text(title, margin, y);
        y += 3;

        doc.setLineWidth(0.6);
        doc.setDrawColor(37, 99, 235); // #2563EB - Accent blue
        doc.line(margin, y, margin + contentWidth, y);
        y += 7;
    };

    // Helper: Add 2-column key-value grid
    const addGridRows = (rows) => {
        // rows is an array of tuples: [ [key1, val1], [key2, val2] ] (up to 2 items per line)
        const colWidth = contentWidth / 2;

        rows.forEach((pair) => {
            checkSpace(12);

            pair.forEach((item, index) => {
                if (!item) return;
                const xPos = margin + (index * colWidth);
                const label = safeString(item[0], "Label");
                const rawVal = safeString(item[1], "Not available");

                doc.setFont("helvetica", "bold");
                doc.setFontSize(9.5);
                doc.setTextColor(100, 116, 139); // Muted slate
                doc.text(`${label}:`, xPos, y);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9.5);
                doc.setTextColor(15, 23, 42); // Dark slate

                const valX = xPos + 36;
                const maxValWidth = colWidth - 38;
                const splitVal = doc.splitTextToSize(rawVal, maxValWidth);
                doc.text(splitVal[0] || "Not available", valX, y);
            });
            y += 6;
        });
        y += 2;
    };

    // Helper: Add Bulleted List
    const addBulletList = (title, items) => {
        const itemArray = safeArray(items);
        checkSpace(12);

        if (title) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(30, 41, 59);
            doc.text(title, margin, y);
            y += 5;
        }

        if (itemArray.length === 0) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184);
            doc.text("• No specific recommendations recorded.", margin + 4, y);
            y += 6;
            return;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);

        itemArray.forEach((item) => {
            const itemText = safeString(item);
            const lines = doc.splitTextToSize(itemText, contentWidth - 8);
            const neededH = lines.length * 4.5 + 2;

            checkSpace(neededH);

            doc.text("•", margin + 2, y);
            lines.forEach((line, lineIdx) => {
                doc.text(line, margin + 7, y);
                y += 4.5;
            });
            y += 1;
        });
        y += 3;
    };

    // -------------------------------------------------------------
    // 1. REPORT HEADER BANNER
    // -------------------------------------------------------------
    doc.setFillColor(30, 58, 138); // Navy header box
    doc.rect(margin, y, contentWidth, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("HEALTHWISE AI", margin + 8, y + 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(147, 197, 253); // Light blue
    doc.text("COMPREHENSIVE HEALTH & NUTRITION ANALYSIS REPORT", margin + 8, y + 17);

    // Right-aligned report timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    const todayStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.text(`Generated: ${todayStr}`, margin + contentWidth - 8, y + 10, { align: "right" });
    doc.text("Confidential Medical Record", margin + contentWidth - 8, y + 17, { align: "right" });

    y += 30;

    // -------------------------------------------------------------
    // 2. PATIENT PROFILE INFORMATION
    // -------------------------------------------------------------
    const pName = safeString(userName, safeString(healthData?.name, "User"));
    const pEmail = safeString(userEmail, safeString(healthData?.email, "Not available"));
    const pAge = healthData?.age ? `${healthData.age} yrs` : "Not available";
    let pGender = safeString(healthData?.gender);
    if (pGender !== "Not available") pGender = pGender.charAt(0).toUpperCase() + pGender.slice(1);

    const pGoal = safeString(healthData?.goal, safeString(localStorage.getItem("healthwise_current_goal"), "General Health Improvement"));
    const pCreated = healthData?.created_at
        ? new Date(healthData.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : todayStr;

    addSectionHeader("1. Patient Profile Information");
    addGridRows([
        [["Patient Name", pName], ["Email Address", pEmail]],
        [["Age", pAge], ["Gender", pGender]],
        [["Primary Health Goal", pGoal], ["Assessment Date", pCreated]]
    ]);

    // -------------------------------------------------------------
    // 3. BODY METRICS & VITALS
    // -------------------------------------------------------------
    const pHeight = healthData?.height ? `${healthData.height} cm` : "Not available";
    const pWeight = healthData?.weight ? `${healthData.weight} kg` : "Not available";
    
    // BMI & Category calculation
    const bmiVal = healthData?.bmi ? parseFloat(healthData.bmi) : null;
    let bmiCategory = "Not available";
    if (bmiVal) {
        if (bmiVal < 18.5) bmiCategory = "Underweight";
        else if (bmiVal < 25.0) bmiCategory = "Normal weight";
        else if (bmiVal < 30.0) bmiCategory = "Overweight";
        else bmiCategory = "Obese";
    }
    const bmiText = bmiVal ? `${bmiVal.toFixed(2)} (${bmiCategory})` : "Not available";

    // Blood pressure formatting
    const sysVal = healthData?.systolic_bp || healthData?.systolic || localStorage.getItem("healthwise_current_systolic");
    const diaVal = healthData?.diastolic_bp || healthData?.diastolic || localStorage.getItem("healthwise_current_diastolic");
    const bpText = (sysVal && diaVal) ? `${sysVal}/${diaVal} mmHg` : "Not available";

    let smokingText = safeString(healthData?.smoking_status);
    if (smokingText !== "Not available") smokingText = smokingText.charAt(0).toUpperCase() + smokingText.slice(1);

    let activityText = safeString(healthData?.physical_activity);
    if (activityText !== "Not available") activityText = activityText.charAt(0).toUpperCase() + activityText.slice(1);

    let conditionsText = safeString(healthData?.health_conditions);
    if (conditionsText === "none") conditionsText = "None reported";
    else if (conditionsText !== "Not available") {
        conditionsText = conditionsText.split(",").map(c => c.trim().charAt(0).toUpperCase() + c.trim().slice(1)).join(", ");
    }

    addSectionHeader("2. Body Metrics, Vitals & Health Habits");
    addGridRows([
        [["Height", pHeight], ["Weight", pWeight]],
        [["Body Mass Index (BMI)", bmiText], ["Blood Pressure", bpText]],
        [["Smoking Status", smokingText], ["Physical Activity", activityText]],
        [["Diagnosed Conditions", conditionsText], ["Diet Preference", safeString(localStorage.getItem("healthwise_current_dietType"))]]
    ]);

    // -------------------------------------------------------------
    // 4. ML HEALTH RISK ASSESSMENT
    // -------------------------------------------------------------
    addSectionHeader("3. Machine Learning Risk Assessment");
    
    let predLevel = safeString(prediction?.prediction, "Low");
    let predScore = prediction?.risk_score !== undefined ? `${Math.round(prediction.risk_score * 100)}%` : "N/A";
    let predMsg = safeString(prediction?.message, "AI-based health risk estimation generated successfully.");

    addGridRows([
        [["ML Risk Level", `${predLevel} Risk`], ["Model Risk Score", predScore]],
        [["Model Engine", "RandomForestClassifier (Scikit-Learn)"], ["Assessment Status", "Completed"]]
    ]);

    // Disclaimer box for ML
    checkSpace(14);
    doc.setFillColor(239, 246, 255); // Soft blue box
    doc.rect(margin, y, contentWidth, 12, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 64, 175);
    doc.text(`Notice: ${predMsg} Note: Risk score is generated for project demonstration purposes.`, margin + 4, y + 7);
    y += 16;

    // -------------------------------------------------------------
    // 5. BACKEND LIFESTYLE & NUTRITION RECOMMENDATIONS
    // -------------------------------------------------------------
    addSectionHeader("4. Personalized Baseline Recommendations");

    const recObject = (recommendations && typeof recommendations === "object") ? recommendations : {};
    const dietaryRecs = recObject.dietary || recObject.nutrition || [];
    const exerciseRecs = recObject.exercise || recObject.activity || [];
    const lifestyleRecs = recObject.lifestyle || [];

    addBulletList("Dietary & Nutritional Guidelines", dietaryRecs);
    addBulletList("Physical Activity & Exercise Plans", exerciseRecs);
    addBulletList("Lifestyle & General Habits", lifestyleRecs);

    // -------------------------------------------------------------
    // 6. GEMINI AI RECOMMENDATIONS & DIET CHART (IF AVAILABLE)
    // -------------------------------------------------------------
    let geminiData = null;
    const storedGemini = localStorage.getItem("healthwise_current_gemini_recommendations");
    if (storedGemini) {
        try {
            geminiData = JSON.parse(storedGemini);
        } catch (e) {}
    }

    if (geminiData && typeof geminiData === "object") {
        addSectionHeader("5. Gemini AI Personalized Diet & Nutrition Plan");

        // AI Summary
        if (geminiData.summary) {
            checkSpace(12);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(30, 41, 59);
            doc.text("AI Profile Summary:", margin, y);
            y += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(51, 65, 85);
            const sumLines = doc.splitTextToSize(safeString(geminiData.summary), contentWidth);
            sumLines.forEach(line => {
                checkSpace(5);
                doc.text(line, margin, y);
                y += 4.5;
            });
            y += 4;
        }

        // Diet Chart
        const dietChart = geminiData.diet_chart || {};
        const meals = [
            ["Breakfast", dietChart.breakfast],
            ["Mid-Morning Snack", dietChart.mid_morning],
            ["Lunch", dietChart.lunch],
            ["Evening Snack", dietChart.evening_snack],
            ["Dinner", dietChart.dinner],
            ["Hydration Guidance", dietChart.hydration || geminiData.hydration_guidance]
        ];

        checkSpace(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("Personalized Daily Diet Chart:", margin, y);
        y += 6;

        meals.forEach(([mealTitle, mealDesc]) => {
            if (!mealDesc) return;
            const titleStr = `${mealTitle}: `;
            const descStr = safeString(mealDesc);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(30, 58, 138);

            const lines = doc.splitTextToSize(descStr, contentWidth - 36);
            const neededH = Math.max(lines.length * 4.5, 6) + 2;

            checkSpace(neededH);

            doc.text(titleStr, margin + 2, y);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 41, 59);

            lines.forEach((line, lIdx) => {
                doc.text(line, margin + 36, y + (lIdx * 4.5));
            });

            y += Math.max(lines.length * 4.5, 6) + 1.5;
        });
        y += 4;

        // Recommended Foods & Foods to Limit
        if (geminiData.recommended_foods) {
            addBulletList("Recommended Foods", geminiData.recommended_foods);
        }
        if (geminiData.foods_to_limit) {
            addBulletList("Foods to Limit / Avoid", geminiData.foods_to_limit);
        }

        // Additional AI Advice
        const additionalAdvice = [];
        if (geminiData.lifestyle_recommendations) additionalAdvice.push(`Lifestyle: ${geminiData.lifestyle_recommendations}`);
        if (geminiData.physical_activity_suggestions) additionalAdvice.push(`Exercise: ${geminiData.physical_activity_suggestions}`);
        if (geminiData.practical_habits) additionalAdvice.push(`Daily Habits: ${geminiData.practical_habits}`);
        if (geminiData.safety_considerations) additionalAdvice.push(`Safety Note: ${geminiData.safety_considerations}`);

        if (additionalAdvice.length > 0) {
            addBulletList("AI Lifestyle & Safety Recommendations", additionalAdvice);
        }
    }

    // -------------------------------------------------------------
    // 7. OFFICIAL MEDICAL DISCLAIMER
    // -------------------------------------------------------------
    checkSpace(28);

    doc.setFillColor(254, 252, 232); // Light yellow disclaimer box
    doc.rect(margin, y, contentWidth, 22, "F");
    doc.setLineWidth(0.4);
    doc.setDrawColor(250, 204, 21);
    doc.rect(margin, y, contentWidth, 22, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(161, 98, 7); // Dark yellow title
    doc.text("IMPORTANT MEDICAL DISCLAIMER", margin + 5, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(113, 63, 18);

    const disclaimerText = "HealthWise AI provides educational and general wellness insights only. It is not a clinical diagnosis or a substitute for professional medical advice, evaluation, or treatment. Always seek the advice of a qualified physician or healthcare provider regarding any medical condition or health goal.";
    const discLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
    discLines.forEach((line, idx) => {
        doc.text(line, margin + 5, y + 10 + (idx * 3.5));
    });

    y += 26;

    // -------------------------------------------------------------
    // 8. PAGE NUMBERING & FOOTERS (ALL PAGES)
    // -------------------------------------------------------------
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setLineWidth(0.4);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("HealthWise AI — Personalized Medical & Nutrition Report", margin, pageHeight - 7);
        doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, pageHeight - 7, { align: "right" });
    }

    // Save PDF
    const sanitizedName = pName.replace(/[^a-z0-9]/gi, "_");
    doc.save(`HealthWise_AI_Report_${sanitizedName}.pdf`);
}

export default generatePDFReport;
