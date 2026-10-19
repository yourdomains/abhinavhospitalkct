# Abhinav Hospital (Mother & Child Care Hospital) - 3D Medical Web Platform

An interactive, modern 3D healthcare website for **Abhinav Hospital (Mother & Child Care Hospital)** located in **Kuchaman City, Rajasthan (341508)**.

---

## 📍 Hospital Profile & Google Maps Integration
* **Hospital Name:** Abhinav Hospital (Mother & Child Care Hospital)
* **Address:** Near Power House, Budsu Road, Jiliya, Kuchaman City, Rajasthan — 341508
* **GPS Coordinates:** `27.1536881, 74.8517471`
* **Google Maps Official Link:** [https://maps.app.goo.gl/kwXwnf2FdtyNRuRz8](https://maps.app.goo.gl/kwXwnf2FdtyNRuRz8)
* **Emergency Helpline:** `+91 91662 63755`
* **Chief Pediatrician & Neonatologist:** Dr. Ramlal Choudhary (MBBS, DCH)

---

## 🌟 Key Features

### 1. 🏢 Interactive 3D WebGL Hospital Campus (`js/three-hospital.js`)
* **3D Architecture:** Procedural 4-tier medical campus (Ground: 24/7 Emergency, Level 1: Maternity, Level 2: Advanced NICU, Level 3: Pediatrics, Roof: Helipad).
* **Exploded Floor View Mode:** Allows visitors to separate floors vertically in 3D space to inspect individual department cutaways.
* **Animated Ambulance with Flashing Beacons:** Dynamic emergency van driving on the perimeter access road with alternating red & blue point lights.
* **Atmospheric Lighting:** 
  * ☀️ **Daylight:** Crisp clinical sun and natural shadow maps.
  * 🌇 **Sunset:** Golden hour warm glow with long shadows.
  * 🌙 **Night Glow:** Glowing window rooms, spotlighting, pulsing hospital cross, and illuminated street lamps.
* **Interactive Hotspots:** Clickable 3D pulsing pins focusing camera smoothly onto Emergency, NICU, Delivery, Pediatrics, or Helipad.

### 2. 🗺️ Google Maps Location & Transit Command Center
* **Embedded Google Map:** Live responsive map showing exact pin coordinates `27.1536881, 74.8517471`.
* **Direct Navigation:** One-tap GPS route launcher to `https://maps.app.goo.gl/kwXwnf2FdtyNRuRz8`.
* **Interactive Transit Planner:** Instant distance and estimated travel time calculator from:
  * Kuchaman Central Bus Stand / Chungi Naka (~1.2 km / 3 mins)
  * Kuchaman City Railway Station (~3.4 km / 8 mins)
  * Didwana Mega Highway Junction (~4.8 km / 10 mins)

### 3. 👶 Mother & Child Specialized Healthcare
* **Maternity & Labor Suites:** Painless deliveries, high-risk pregnancy monitoring, 4D sonography.
* **Level III NICU:** Servo incubators, LED phototherapy for neonatal jaundice, bubble CPAP.
* **Pediatrics & Vaccination:** Daily consultations led by Dr. Ramlal Choudhary, full childhood immunization tracking.
* **24/7 Emergency & Ambulance:** Rapid response with dedicated dispatch and in-house pharmacy.

### 4. 📱 Direct WhatsApp Appointment Scheduler (`js/app.js`)
* Interactive modal with department selection, preferred date, patient name, and reason for visit.
* Automatically prepares a formatted booking text and connects the patient to the hospital reception via WhatsApp.

---

## 🚀 How to Run the Website

Simply double-click `index.html` to open directly in any modern browser (Google Chrome, Microsoft Edge, Firefox, Safari).

Alternatively, launch with any local static web server:
```powershell
# Using PowerShell's built-in web viewer or opening default browser:
Start-Process "index.html"
```
