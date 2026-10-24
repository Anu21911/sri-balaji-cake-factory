# 🎂 SRI BALAJI CAKE FACTORY — FULL-STACK WEB APPLICATION

> **“Made with Love, Delivered with Care.”**  
> *“Because your happiness matters to us more than anything.”*

A modern, full-stack bakery web application built specifically for **Sri Balaji Cake Factory** located at **SangaReddy Road, Narsapur**.

---

## 🌐 APPLICATION ACCESS LINKS

The application server is actively running:

* **Primary Application URL (Customer Portal & Storefront):**  
  👉 **[http://localhost:5000](http://localhost:5000)**

* **Direct Customer Portal:**  
  👉 **[http://localhost:5000/#home](http://localhost:5000/#home)**

* **Direct Cake Menu & Weight Pricing:**  
  👉 **[http://localhost:5000/#menu](http://localhost:5000/#menu)**

* **Custom Cake Idea Designer ("Have Your Own Cake Idea?"):**  
  👉 **[http://localhost:5000/#custom-idea](http://localhost:5000/#custom-idea)**

* **Dedicated Owner Portal Login:**  
  👉 **[http://localhost:5000/#owner-login](http://localhost:5000/#owner-login)**

* **Owner Management Dashboard (Protected):**  
  👉 **[http://localhost:5000/#owner-dashboard](http://localhost:5000/#owner-dashboard)**

---

## 👑 OWNER CREDENTIALS & FIRST-TIME SECURITY

* **Owner Name:** `RAKESH`
* **Owner Mobile:** `9963390327`
* **Initial Password:** `R@khi1234`
* **Role Verification:** Strict server-side verification using dedicated `Owner` database collection and JWT authentication with `isOwner: true`.
* **First-Time Password Change:** On first login, a non-dismissible security modal prompts the owner to set their personal private password before accessing operational controls.
* **To Re-seed or Reset Owner Account:**
  ```bash
  node backend/src/seed/seedData.js
  ```

---

## 🎂 EXACT CAKE MENU & VERIFIED PRICE RULES

> ⚠️ **Important Policy:** Only regular cakes are available. There are **NO eggless cakes**. No eggless toggles or filters are shown.

| Cake Flavour | 1 kg | 2 kg | 3 kg | Authentic Product Photo |
| :--- | :---: | :---: | :---: | :--- |
| **Pineapple Cake** | **₹280** | **₹560** | **₹840** | Real round bakery pineapple cake with yellow glaze & pineapple slices |
| **Butterscotch Cake** | **₹280** | **₹560** | **₹840** | Real butterscotch praline cake with caramel drizzle |
| **Chocolate Cake** | **₹450** | **₹900** | **₹1,350** | Rich dark chocolate truffle fudge cake |
| **Vanilla Cake** | **₹450** | **₹900** | **₹1,350** | Pure vanilla bean cream cake |
| **Rasmalai Cake** | **₹700** | **₹1,400** | **₹2,100** | Authentic saffron cardamom cake with real rasmalai & pistachios |

*Selecting a weight (1 kg, 2 kg, 3 kg) updates the price immediately on the card, and all totals are strictly verified on the backend.*

---

## 🎉 ADDITIONAL CELEBRATION PRODUCTS

| Celebration Product | Exact Price | Safe-Use & Handling Guidelines |
| :--- | :---: | :--- |
| **Sparkles** | **₹20** | Hold away from eyes and flammable materials. Adult supervision required. |
| **Snow Spray** | **₹50** | Aerosol spray can. Do not spray into eyes or near open candle flame. |
| **Paper Shots** | **₹50** (Standard) / **₹80** (Deluxe) | Point upwards towards ceiling and away from people before twisting base. |
| **Shalvas (Celebration Shawl)** | **₹100** | Traditional celebration silk felicitation shawl with zari border to honour the birthday star. |
| **Gun Coils** | **₹120** | Toy celebration cap gun roll ammunition coils for festive sound effects. |

*Customers can purchase celebration products independently or alongside cakes.*

---

## ✨ "HAVE YOUR OWN CAKE IDEA?" (CUSTOM CAKE ORDERS)

* **Homepage Section & Form:**
  * Reference photo upload (JPG, PNG, WEBP max 5MB).
  * Cake name / celebration theme.
  * Description of the desired design.
  * Preferred flavour from the 5 available flavours.
  * Weight (1 kg, 2 kg, 3 kg).
  * Custom cake message.
  * Delivery date and preferred time slot (Morning, Afternoon, Evening).
  * Customer name, mobile number, and address.
* **Owner Review & Quote Workflow:**
  * Status starts as *"Price awaiting owner confirmation"*.
  * Owner inspects the reference picture in Section 9 of the Owner Dashboard.
  * Owner submits a custom quote (e.g. ₹650, ₹1200, etc.) with custom feasibility notes.
  * Customer reviews quote and clicks *"Accept Quote & Confirm Order"*.

---

## 🛡️ OWNER DASHBOARD — 13 NAVIGATION SECTIONS

1. **Dashboard Overview:** Today's orders, incoming, accepted, preparing, ready, completed, rejected, cancelled counts, sales revenue, and low-stock alerts.
2. **New / Incoming Orders:** Real-time incoming customer orders with **Accept** and **Reject** buttons. *(Rejection requires mandatory explanation).*
3. **Accepted Orders:** Orders approved by owner; button to advance to preparation.
4. **Preparation / Before Delivery:** Orders actively baking in the kitchen; advance to packaged ready state.
5. **Ready for Delivery:** Orders packaged for dispatch; advance to out-for-delivery or completed.
6. **Completed Orders:** Historical orders successfully delivered.
7. **Rejected Orders:** Orders rejected by bakery with recorded rejection reason.
8. **Cancelled Orders:** Customer-cancelled orders with recorded customer reason.
9. **Custom Cake Requests:** Visual inspection of customer uploaded design photos, quoting interface, and acceptance.
10. **Products and Menu Management:** Edit prices, manage stock, toggle availability, and upload/replace product photos.
11. **Customer Database:** Searchable customer directory with registration date, total spend, order history inspection, and **CSV export**.
12. **Notifications:** Real-time WebSocket notifications with Web Audio chime and read/unread status.
13. **Business Settings:** Manage shop details, delivery fee per km (₹4/km), operating hours, and customer policies.

---

## 📍 OFFICIAL SHOP DETAILS & VERIFIED CONTACT LINKS

* **Business Name:** Sri Balaji Cake Factory
* **Address:** SangaReddy Road, Narsapur
* **Phone / Click-to-Call:** `tel:9963390327` (Dial `9963390327`)
* **WhatsApp Chat:** [https://wa.me/919963393270](https://wa.me/919963393270)
* **Instagram Profile:** [https://www.instagram.com/_rakhi_0206/](https://www.instagram.com/_rakhi_0206/)
* **Google Maps Directions:** [https://www.google.com/maps/search/?api=1&query=SangaReddy%20Road%2C%20Narsapur%2C%20Telangana%2C%20India](https://www.google.com/maps/search/?api=1&query=SangaReddy%20Road%2C%20Narsapur%2C%20Telangana%2C%20India)
* **Delivery Fee Rate:** ₹4 per kilometre calculated from bakery.

---

## 🚀 HOW TO START OR RESTART THE APPLICATION

```bash
# Start backend API and serve built frontend on port 5000:
npm start

# Or run backend in watch mode:
npm run dev:backend

# Or run frontend in Vite hot-reload mode:
npm run dev:frontend
```
