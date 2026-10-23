# Bilan Nutritionnel Oncologique (SFNCM)

Application médicale d'évaluation et de suivi nutritionnel pour patients en oncologie, conforme aux référentiels de la **SFNCM** (Société Francophone de Nutrition Clinique et Métabolisme).

## ✨ Fonctionnalités

- **Calcul IMC & Statut Nutritionnel** : Classification OMS, seuils de dénutrition SFNCM ajustés selon l'âge (< 70 ans ou ≥ 70 ans), calcul de la perte de poids récente.
- **Cibles Métaboliques Personnalisées** :
  - Énergie : 25 à 35 kcal/kg/j (standard 30 kcal/kg/j, ajusté selon l'activité et l'état clinique).
  - Protéines : 1,2 à 1,5 g/kg/j (minimum 1,0 g/kg/j).
  - Eau : 30 à 35 ml/kg/j.
- **Relevé Alimentaire Quotidien (Ingestas)** : Saisie structurée par repas (Petit-déjeuner, Collation matin, Déjeuner, Goûter, Dîner, Collation soir). Recherche nutritionnelle automatique en texte libre : interrogation d'**OpenFoodFacts** avec bascule automatique sur **USDA FoodData Central ([fdc.nal.usda.gov](https://fdc.nal.usda.gov/))** et base clinique française si l'aliment n'est pas répertorié. Équivalences métrologiques automatiques (1 càc = 5 mL, 1 bol = 250 mL, 1 assiette = 250 g/mL).
- **Stratégie Nutritionnelle par Paliers SFNCM** : Enrichissement alimentaire, CNO (Compléments Nutritionnels Oraux), Nutrition Entérale / Parentérale avec rappels d'indications.
- **Export PDF A4 Soigné & Impression** : Synthèse clinique prête à l'impression ou à l'archivage dans le dossier patient.
- **Confidentialité & Zéro Rétention** : Traitement 100 % in-memory dans le navigateur. Aucune donnée patient n'est envoyée ou stockée sur un serveur distant ni dans le stockage persistant.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Construction de la version de production
npm run build
```

## 🛠️ Technologies

- **React 18** & **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**
