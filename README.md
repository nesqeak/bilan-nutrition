# Bilan Nutritionnel Oncologique (SFNCM)

Application d'évaluation nutritionnelle pour patients en oncologie, inspirée des référentiels de la **SFNCM**
(Société Francophone de Nutrition Clinique et Métabolisme).

## Fonctionnalités

- **Données patient** : IMC et perte de poids sur 6 mois.
- **Cibles** selon la phase de traitement :
  - surveillance : 25 à 30 kcal/kg/j et 1,0 à 1,2 g de protéines/kg/j ;
  - traitement actif (radio-, chimio-, immunothérapie) : 30 à 35 kcal/kg/j et 1,2 à 1,5 g/kg/j.
- **Prise en charge en cours** : score SEFI, compléments nutritionnels oraux, nutrition entérale et parentérale
  (catalogue de poches).
- **Relevé alimentaire** repas par repas, en texte libre : les valeurs nutritionnelles sont recherchées sur
  **OpenFoodFacts**. Si l'aliment n'y figure pas, un lien **« Rechercher sur Google »** s'affiche sur la ligne et
  les calories / protéines pour 100 g sont à saisir à la main (badge « À compléter », puis « Saisie manuelle »).
  Un aliment choisi dans les suggestions utilise directement les valeurs de la base locale.
  Équivalences : 1 càc = 5 mL, 1 bol = 250 mL, 1 assiette = 250 g.
- **Bilan** : comparaison apports / cibles, proposition de prise en charge (CNO, NE, NP) et points de vigilance.
- **Export PDF A4** et impression, avec l'en-tête HCL – Hôpital Lyon Sud des PPS.
- **Confidentialité** : les données du patient restent dans le navigateur ; seuls les noms d'aliments sont envoyés
  à OpenFoodFacts.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # vérification TypeScript
npm run build
```

## Publication sur GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` compile le site et le publie à chaque push sur `main`
(ou manuellement depuis l'onglet *Actions*). Réglage nécessaire une seule fois :
**Settings → Pages → Build and deployment → Source : « GitHub Actions »**.

## Organisation du code

```
src/
├── App.tsx                     État global et enchaînement des écrans
├── types.ts                    Types métier
├── data/                       Données de référence (aliments, poches, CNO, unités, état initial)
├── lib/
│   ├── clinical.ts             Calculs cliniques : cibles, apports, écart, recommandation SFNCM
│   ├── report.ts               Assemblage des données du bilan
│   └── utils.ts
├── services/
│   └── foodLookup.ts           Recherche OpenFoodFacts, lien de recherche Google
└── components/
    ├── ui/                     Composants génériques (carte, modale, champs, autocomplétion)
    ├── forms/                  Formulaires patient, traitement, prise en charge
    ├── food/                   Relevé alimentaire
    └── report/                 Bilan et export PDF
```

## Technologies

React 19, TypeScript, Vite, Tailwind CSS 4, Lucide, jsPDF + html-to-image.
