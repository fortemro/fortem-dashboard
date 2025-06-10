# Fortem Dashboard

O aplicație web modernă pentru managementul simplificat al comenzilor de produse Fortem, creată special pentru agenții de vânzări (MZV) și administratori.

![Dashboard Screenshot](https://imgur.com/a/PQlfeGe)

## 📜 Despre Proiect

Acest proiect a fost dezvoltat pentru a oferi o soluție digitală, rapidă și eficientă pentru plasarea și urmărirea comenzilor de produse. Aplicația este un panou de control (dashboard) care permite utilizatorilor autentificați (agenți de vânzări) să:
* Creeze comenzi noi pentru clienți (distribuitori).
* Utilizeze un sistem inteligent **"Găsește sau Creează"** pentru distribuitori, care elimină necesitatea unei liste predefinite și menține datele curate.
* Adauge produse în comandă dintr-un catalog predefinit.
* Calculeze automat totaluri pe baza unor reguli simple (ex: preț per palet).
* Vizualizeze și să duplice comenzi anterioare pentru o operare rapidă.
* Urmărească statusul comenzilor (ex: în așteptare, în tranzit, livrată).

Aplicația include și un **panou de administrare** care oferă o privire de ansamblu asupra tuturor comenzilor din sistem.

## 🚀 Construit Cu:

Acest proiect folosește o serie de tehnologii moderne pentru a asigura o experiență de utilizare fluidă și o dezvoltare eficientă:

* **Framework:** [React](https://reactjs.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Limbaj:** [TypeScript](https://www.typescriptlang.org/)
* **Backend & Bază de Date:** [Supabase](https://supabase.io/)
    * Bază de date PostgreSQL
    * Autentificare
    * Edge Functions (pentru trimiterea de email-uri)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Componente UI:** [shadcn/ui](https://ui.shadcn.com/)
* **Management Formulare:** [React Hook Form](https://react-hook-form.com/)

## 🛠️ Pornire Proiect (Getting Started)

Pentru a rula acest proiect local, urmează acești pași simpli.

### Prerechizite

Asigură-te că ai instalat [Node.js](https://nodejs.org/) (versiunea 18 sau mai recentă).

### Instalare

1.  **Clonează repository-ul:**
    ```bash
    git clone [https://github.com/fortemro/fortem-dashboard.git](https://github.com/fortemro/fortem-dashboard.git)
    cd fortem-dashboard
    ```

2.  **Instalează dependențele:**
    ```bash
    npm install
    ```

3.  **Configurează variabilele de mediu:**
    * Creează un fișier nou la rădăcina proiectului numit `.env`.
    * Adaugă în acest fișier cheile tale de la Supabase, pe care le găsești în Supabase Dashboard > Project Settings > API.
    * Fișierul `.env` ar trebui să arate astfel:
        ```
        VITE_SUPABASE_URL="URL-UL_PROIECTULUI_TAU_SUPABASE"
        VITE_SUPABASE_ANON_KEY="CHEIA_TA_ANON_SUPABASE"
        ```

4.  **Pornește serverul de dezvoltare:**
    ```bash
    npm run dev
    ```
    Deschide [http://localhost:5173](http://localhost:5173) (sau portul indicat în consolă) în browserul tău.

## 📂 Structura Proiectului

Codul este organizat într-un mod modular pentru a facilita mentenanța și dezvoltarea ulterioară:

/src
|-- /components/       # Componente UI reutilizabile (Card, Button, Tabele etc.)
|   |-- /ui/           # Componente de bază generate de shadcn/ui
|   |-- /comanda/      # Componente specifice formularului de comandă
|   |-- ...
|
|-- /data-types/       # Definițiile centrale TypeScript (Comanda, Produs etc.)
|
|-- /hooks/            # Hook-uri custom pentru logică (ex: useComenzi, useProduse)
|   |-- /comenzi/      # Hook-uri specifice pentru logica de creare comenzi
|
|-- /integrations/     # Cod pentru integrarea cu servicii externe
|   |-- /supabase/     # Configurația clientului Supabase
|
|-- /pages/            # Componentele care reprezintă paginile aplicației (Dashboard, Comanda etc.)


---
Acest README oferă o imagine de ansamblu clară și ajută pe oricine (inclusiv pe tine în viitor) să înțeleagă rapid proiectul.