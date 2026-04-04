"""
Flight Price Alert Agent
Checks prices daily and sends Gmail alerts when prices drop or fall below your threshold.
"""

import json
import os
import smtplib
import schedule
import time
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from amadeus import Client, ResponseError
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent
FLIGHTS_FILE = BASE_DIR / "flights.json"
HISTORY_FILE = BASE_DIR / "price_history.json"

amadeus = Client(
    client_id=os.getenv("AMADEUS_CLIENT_ID"),
    client_secret=os.getenv("AMADEUS_CLIENT_SECRET"),
)

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
CHECK_TIME = os.getenv("CHECK_TIME", "09:00")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_cheapest_price(flight):
    """Query Amadeus for the cheapest round-trip price."""
    params = {
        "originLocationCode": flight["origin"],
        "destinationLocationCode": flight["destination"],
        "departureDate": flight["departure_date"],
        "returnDate": flight["return_date"],
        "adults": flight.get("adults", 1),
        "currencyCode": flight.get("currency", "EUR"),
        "max": 5,
    }
    response = amadeus.shopping.flight_offers_search.get(**params)
    offers = response.data
    if not offers:
        return None
    prices = [float(o["price"]["total"]) for o in offers]
    return min(prices)


def send_email(subject, body_html):
    """Send an alert email via Gmail SMTP."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = GMAIL_ADDRESS
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_ADDRESS, GMAIL_ADDRESS, msg.as_string())
    print(f"  ✉️  Alert sent: {subject}")


def build_email(flight, current_price, previous_price):
    """Build a nice HTML email for the price alert."""
    direction = "ירד ⬇️" if previous_price and current_price < previous_price else "זול מהמקסימום שלך ✅"
    change_text = ""
    if previous_price:
        diff = previous_price - current_price
        change_text = f"<p>ירידה של <strong>{diff:.0f} {flight['currency']}</strong> מאז הבדיקה האחרונה ({previous_price:.0f} → {current_price:.0f})</p>"

    return f"""
    <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;padding:20px">
      <h2>✈️ התראת מחיר טיסה {direction}</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;color:#555">מוצא:</td><td><strong>{flight['origin']}</strong></td></tr>
        <tr><td style="padding:8px;color:#555">יעד:</td><td><strong>{flight['destination']}</strong></td></tr>
        <tr><td style="padding:8px;color:#555">יציאה:</td><td>{flight['departure_date']}</td></tr>
        <tr><td style="padding:8px;color:#555">חזרה:</td><td>{flight['return_date']}</td></tr>
        <tr><td style="padding:8px;color:#555">מחיר נוכחי:</td><td style="font-size:1.4em;color:#2a9d3a"><strong>{current_price:.0f} {flight['currency']}</strong></td></tr>
        <tr><td style="padding:8px;color:#555">מחיר מקסימום שלך:</td><td>{flight['max_price']} {flight['currency']}</td></tr>
      </table>
      {change_text}
      <br>
      <a href="https://www.google.com/travel/flights/search?tfs=CBwQAhopag0IAxIJL20vMDFibnEMEgoyMDI2LTA4LTAxcg0IAxIJL20vMDZua2o4GikKB2lnb3J0aHcSCi8gbS8wMXFnbXMSCjIwMjYtMDgtMTByDQgDEgkvbS8wMWJucQw"
         style="background:#1a73e8;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;display:inline-block">
        חפש ב-Google Flights →
      </a>
      <p style="color:#999;font-size:0.8em;margin-top:20px">נבדק ב-{datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
    </div>
    """


def check_flights():
    """Main check loop — runs once per day."""
    print(f"\n[{datetime.now().strftime('%d/%m/%Y %H:%M')}] בודק מחירים...")
    flights = load_json(FLIGHTS_FILE)
    history = load_json(HISTORY_FILE)

    for flight in flights:
        fid = flight["id"]
        print(f"  ✈️  {flight['origin']} → {flight['destination']} ({flight['departure_date']})")
        try:
            current_price = get_cheapest_price(flight)
            if current_price is None:
                print("     לא נמצאו תוצאות")
                continue

            print(f"     מחיר נוכחי: {current_price:.0f} {flight['currency']}")
            previous_price = history.get(fid, {}).get("price")

            price_dropped = previous_price and current_price < previous_price
            below_max = current_price <= flight["max_price"]

            if price_dropped or below_max:
                subject = f"✈️ טיסה {flight['origin']}→{flight['destination']}: {current_price:.0f} {flight['currency']}"
                html = build_email(flight, current_price, previous_price)
                send_email(subject, html)

            history[fid] = {
                "price": current_price,
                "checked_at": datetime.now().isoformat(),
            }

        except ResponseError as e:
            print(f"     שגיאת API: {e}")

    save_json(HISTORY_FILE, history)
    print("  סיום בדיקה.\n")


if __name__ == "__main__":
    print("=" * 50)
    print("✈️  סוכן מחירי טיסות")
    print(f"   בדיקה יומית בשעה {CHECK_TIME}")
    print(f"   קובץ טיסות: {FLIGHTS_FILE}")
    print("=" * 50)

    # Run immediately on startup
    check_flights()

    # Then schedule daily
    schedule.every().day.at(CHECK_TIME).do(check_flights)
    print(f"⏰ הסוכן רץ ברקע. בדיקה הבאה: {CHECK_TIME} בכל יום.")
    print("   לעצירה: Ctrl+C\n")

    while True:
        schedule.run_pending()
        time.sleep(60)
