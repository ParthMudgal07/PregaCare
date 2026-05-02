import pandas as pd
import numpy as np

def calculate_topsis(data, weights, impacts):
    """
    Implementation of TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)
    """
    # Step 1: Normalize the decision matrix
    norm_data = data / np.sqrt((data**2).sum(axis=0))
    
    # Step 2: Multiply by weights
    weighted_data = norm_data * weights
    
    # Step 3: Determine Ideal Best and Ideal Worst
    # Impacts: 1 for positive (+), -1 for negative (-)
    ideal_best = []
    ideal_worst = []
    
    for i, impact in enumerate(impacts):
        if impact == 1:
            ideal_best.append(weighted_data.iloc[:, i].max())
            ideal_worst.append(weighted_data.iloc[:, i].min())
        else:
            ideal_best.append(weighted_data.iloc[:, i].min())
            ideal_worst.append(weighted_data.iloc[:, i].max())
            
    ideal_best = np.array(ideal_best)
    ideal_worst = np.array(ideal_worst)
    
    # Step 4: Calculate separation measures (Distance from best and worst)
    dist_best = np.sqrt(((weighted_data - ideal_best)**2).sum(axis=1))
    dist_worst = np.sqrt(((weighted_data - ideal_worst)**2).sum(axis=1))
    
    # Step 5: Calculate relative closeness to ideal solution (The Score)
    score = dist_worst / (dist_best + dist_worst)
    
    return score

# 1. Load the dataset
file_path = 'NFHS.csv'
df = pd.read_csv(file_path)

# 2. Prepare Data for TOPSIS
# Correcting 'Toabcco' typo from your column description if necessary
# Let's check columns first
cols = df.columns.tolist()
print(f"Columns found: {cols}")

# Based on your description, columns are:
features = [
    'QualityWater', 'Literacy', 'AntenatalCare', 
    'InstitutionalBirths', 'Homebirths', 'BirthBySkilledProfessional', 
    'Obesity', 'Tobacco', 'Alcohol', 'PostnatalCare'
]

# Verify columns exist
features = [f for f in features if f in df.columns]
print(f"Using features: {features}")

X = df[features].copy()

# 3. Define Weights and Impacts
# Weights: Clinical (0.15) > Socio (0.08) > Lifestyle (0.05)
# QualityWater(0.08), Literacy(0.08), AntenatalCare(0.15), 
# InstitutionalBirths(0.15), Homebirths(0.05), BirthBySkilledProfessional(0.15), 
# Obesity(0.04), Tobacco(0.05), Alcohol(0.05), PostnatalCare(0.15)

weights = np.array([0.08, 0.08, 0.15, 0.15, 0.05, 0.15, 0.04, 0.05, 0.05, 0.15])
# Match weights to actual features found
if len(weights) != len(features):
    weights = np.ones(len(features)) / len(features)
else:
    weights = weights / weights.sum()

# Impacts: 1 for Positive, -1 for Negative
# Positive: Water, Literacy, ANC, InstBirth, SkilledProf, Postnatal
# Negative: Homebirth, Obesity, Tobacco, Alcohol
impact_map = {
    'QualityWater': 1, 'Literacy': 1, 'AntenatalCare': 1, 
    'InstitutionalBirths': 1, 'Homebirths': -1, 'BirthBySkilledProfessional': 1, 
    'Obesity': -1, 'Tobacco': -1, 'Alcohol': -1, 'PostnatalCare': 1
}
impacts = [impact_map[f] for f in features]

# 4. Calculate Scores
df['Safety_Score'] = calculate_topsis(X, weights, impacts)

# 5. Rank Districts
df['Rank'] = df['Safety_Score'].rank(ascending=False).astype(int)

# 6. Save and Print
df_sorted = df.sort_values('Rank')
df_sorted.to_csv('District_Safety_Rankings.csv', index=False)

print("\nTop 5 Safest Districts:")
print(df_sorted[['District Names', 'State/UT', 'Safety_Score', 'Rank']].head(5))

print("\nBottom 5 Districts (Needs Improvement):")
print(df_sorted[['District Names', 'State/UT', 'Safety_Score', 'Rank']].tail(5))
