"""
Generate expanded text dataset with 500 samples (100 per category)
"""
import random
import csv

# Set seed for reproducibility
random.seed(42)

# Templates for each category with variations
ROAD_TEMPLATES = [
    "{size} pothole {location}",
    "Road {condition} {location}",
    "{adjective} crack on {road_type}",
    "Street surface {damage} {location}",
    "Asphalt {issue} {location}",
    "{road_type} {problem} {location}",
    "Dangerous {issue} {location}",
    "Multiple potholes on {road_type}",
    "{road_type} needs {urgency} repair",
    "Uneven road {consequence} {location}",
    "{damage} pavement {location}",
    "Road depression {location}",
    "Highway {condition} {location}",
    "Traffic {issue} due to bad road {location}",
    "{adjective} road condition {location}",
]

GARBAGE_TEMPLATES = [
    "{size} garbage pile {location}",
    "Trash {state} from {container}",
    "Waste {action} {location}",
    "Garbage {issue} {location}",
    "Rubbish {state} {location}",
    "{container} {condition} {location}",
    "Garbage truck {problem} {location}",
    "{waste_type} waste {issue} {location}",
    "Uncollected trash {location}",
    "Waste heap {consequence} {location}",
    "Garbage bags {state} {location}",
    "{container} {condition} and {state}",
    "Waste {issue} {location}",
    "Improper waste disposal {location}",
    "Street {state} with litter {location}",
]

WATER_TEMPLATES = [
    "Water pipe {issue} {location}",
    "Sewage {problem} {location}",
    "Drain {condition} {location}",
    "Water {issue} from {source}",
    "Flood water {state} {location}",
    "{condition} drainage system {location}",
    "Water tank {issue} {location}",
    "Pipe {problem} {location}",
    "{adjective} water {state} {location}",
    "{severity} water {issue} {location}",
    "Sewage {consequence} {location}",
    "Water seepage {location}",
    "Manhole {issue} with water",
    "Drainage {condition} {location}",
    "Water supply {problem} {location}",
]

ELECTRICITY_TEMPLATES = [
    "Street light {issue} {location}",
    "Power {problem} {location}",
    "Electric pole {condition} {location}",
    "{adjective} electric wire {state}",
    "Streetlight {issue} {location}",
    "Transformer {problem} {location}",
    "{frequency} power {issue} {location}",
    "{condition} electric {component}",
    "Cable {state} {location}",
    "No power supply {location}",
    "Electric pole {consequence} {location}",
    "{issue} from {component}",
    "Streetlights {condition} {location}",
    "Voltage {problem} {location}",
    "Electric line {issue} {location}",
]

OTHER_TEMPLATES = [
    "{item} {condition} {location}",
    "Tree {state} {location}",
    "{animal} causing {problem}",
    "Footpath {issue} {location}",
    "Public {facility} {condition}",
    "Construction {issue} {location}",
    "{vehicle} {state} {location}",
    "Noise {problem} from {source}",
    "Illegal {action} {location}",
    "Playground {issue} {location}",
    "{signage} {condition} {location}",
    "Wall {issue} {location}",
    "{structure} {condition} {location}",
    "Public {facility} {state}",
    "{problem} in {location}",
]

# Vocabulary for variations
SIZES = ["Big", "Large", "Huge", "Small", "Deep", "Wide", "Massive", "Giant"]
CONDITIONS = ["cracked", "damaged", "broken", "collapsed", "deteriorated", "worn out", "in bad shape", "severely damaged"]
ADJECTIVES = ["Dangerous", "Severe", "Critical", "Urgent", "Major", "Serious", "Bad", "Terrible"]
ROAD_TYPES = ["main road", "highway", "street", "residential street", "city road", "service road", "bypass road", "ring road"]
DAMAGE = ["Cracked", "Broken", "Damaged", "Collapsed", "Sunken", "Uneven"]
ISSUES = ["damage", "problem", "issue", "defect", "fault", "breakdown"]
PROBLEMS = ["blocked", "damaged", "not working", "malfunctioning", "broken", "failed", "out of order"]
URGENCY = ["urgent", "immediate", "emergency", "critical", "quick"]

STATES = ["overflowing", "scattered", "piling up", "accumulating", "lying around", "dumped", "abandoned"]
CONTAINERS = ["dustbin", "garbage bin", "waste bin", "dumpster", "trash can", "collection point"]
WASTE_TYPES = ["Plastic", "Food", "Medical", "Construction", "Industrial", "Household"]
ACTIONS = ["dumped", "scattered", "thrown", "left unattended", "not collected", "piled up"]

WATER_ISSUES = ["leaking", "bursting", "overflowing", "seeping", "dripping", "flooding"]
SOURCES = ["underground pipe", "main pipeline", "water tank", "overhead tank", "supply line", "distribution pipe"]
SEVERITY = ["Heavy", "Continuous", "Severe", "Major", "Constant", "Excessive"]

ELECTRIC_COMPONENTS = ["junction box", "transformer", "pole", "wire", "cable", "connection"]
FREQUENCIES = ["Frequent", "Continuous", "Regular", "Constant", "Repeated", "Ongoing"]

ITEMS = ["Park bench", "Public seating", "Fence", "Railing", "Gate", "Barrier"]
ANIMALS = ["Stray dogs", "Cattle", "Monkeys", "Pigs", "Stray animals"]
FACILITIES = ["toilet", "park", "garden", "playground", "bus shelter", "waiting area"]
VEHICLES = ["Abandoned vehicle", "Broken vehicle", "Old car", "Scrap vehicle"]
SIGNAGE = ["Street sign", "Name board", "Direction board", "Information board", "Warning sign"]
STRUCTURES = ["Foot overbridge", "Subway", "Pedestrian bridge", "Staircase", "Walkway"]

# Location variations
LOCATIONS = [
    "near the bus stop", "on main road", "near the market", "in front of hospital",
    "near the school", "beside the temple", "near railway crossing", "at the junction",
    "near the park", "beside the bridge", "near apartment complex", "on highway",
    "near shopping mall", "beside the canal", "in residential area", "near office building",
    "at traffic signal", "near bus depot", "beside the garden", "near community center",
    "on service road", "near metro station", "beside the lake", "in colony",
    "near police station", "beside the stadium", "at main entrance", "near parking lot",
    "on ring road", "near government office", "beside the river", "in industrial area",
    "near cinema hall", "beside the mosque", "at roundabout", "near petrol pump",
    "on bypass road", "near railway station", "beside the church", "in commercial area",
]

def generate_road_samples(n=100):
    samples = []
    used = set()
    
    while len(samples) < n:
        template = random.choice(ROAD_TEMPLATES)
        
        text = template.format(
            size=random.choice(SIZES),
            location=random.choice(LOCATIONS),
            condition=random.choice(CONDITIONS),
            adjective=random.choice(ADJECTIVES),
            road_type=random.choice(ROAD_TYPES),
            damage=random.choice(DAMAGE),
            issue=random.choice(ISSUES),
            problem=random.choice(PROBLEMS),
            urgency=random.choice(URGENCY),
            consequence="causing accidents"
        )
        
        if text not in used:
            samples.append(text)
            used.add(text)
    
    return samples

def generate_garbage_samples(n=100):
    samples = []
    used = set()
    
    while len(samples) < n:
        template = random.choice(GARBAGE_TEMPLATES)
        
        text = template.format(
            size=random.choice(SIZES),
            location=random.choice(LOCATIONS),
            state=random.choice(STATES),
            container=random.choice(CONTAINERS),
            action=random.choice(ACTIONS),
            issue=random.choice(ISSUES),
            condition=random.choice(CONDITIONS),
            problem=random.choice(PROBLEMS),
            waste_type=random.choice(WASTE_TYPES),
            consequence="producing bad smell"
        )
        
        if text not in used:
            samples.append(text)
            used.add(text)
    
    return samples

def generate_water_samples(n=100):
    samples = []
    used = set()
    
    while len(samples) < n:
        template = random.choice(WATER_TEMPLATES)
        
        text = template.format(
            issue=random.choice(WATER_ISSUES),
            location=random.choice(LOCATIONS),
            problem=random.choice(PROBLEMS),
            condition=random.choice(CONDITIONS),
            source=random.choice(SOURCES),
            state=random.choice(STATES[:5]),  # Use subset
            adjective=random.choice(ADJECTIVES),
            severity=random.choice(SEVERITY),
            consequence="causing flooding"
        )
        
        if text not in used:
            samples.append(text)
            used.add(text)
    
    return samples

def generate_electricity_samples(n=100):
    samples = []
    used = set()
    
    while len(samples) < n:
        template = random.choice(ELECTRICITY_TEMPLATES)
        
        text = template.format(
            issue=random.choice(PROBLEMS),
            location=random.choice(LOCATIONS),
            problem=random.choice(PROBLEMS),
            condition=random.choice(CONDITIONS),
            adjective=random.choice(ADJECTIVES),
            state="hanging dangerously",
            frequency=random.choice(FREQUENCIES),
            component=random.choice(ELECTRIC_COMPONENTS),
            consequence="causing danger"
        )
        
        if text not in used:
            samples.append(text)
            used.add(text)
    
    return samples

def generate_other_samples(n=100):
    samples = []
    used = set()
    
    while len(samples) < n:
        template = random.choice(OTHER_TEMPLATES)
        
        text = template.format(
            item=random.choice(ITEMS),
            condition=random.choice(CONDITIONS),
            location=random.choice(LOCATIONS),
            state=random.choice(STATES),
            animal=random.choice(ANIMALS),
            problem=random.choice(PROBLEMS),
            facility=random.choice(FACILITIES),
            issue=random.choice(ISSUES),
            vehicle=random.choice(VEHICLES),
            action="parking",
            source="construction site",
            signage=random.choice(SIGNAGE),
            structure=random.choice(STRUCTURES)
        )
        
        if text not in used:
            samples.append(text)
            used.add(text)
    
    return samples

def main():
    print("Generating expanded dataset with 500 samples...")
    
    # Generate samples for each category
    road_samples = generate_road_samples(100)
    garbage_samples = generate_garbage_samples(100)
    water_samples = generate_water_samples(100)
    electricity_samples = generate_electricity_samples(100)
    other_samples = generate_other_samples(100)
    
    # Combine all samples
    dataset = []
    dataset.extend([(text, "Road") for text in road_samples])
    dataset.extend([(text, "Garbage") for text in garbage_samples])
    dataset.extend([(text, "Water") for text in water_samples])
    dataset.extend([(text, "Electricity") for text in electricity_samples])
    dataset.extend([(text, "Other") for text in other_samples])
    
    # Shuffle dataset
    random.shuffle(dataset)
    
    # Write to CSV
    output_path = "data/text_dataset.csv"
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['text', 'category'])
        writer.writerows(dataset)
    
    print(f"✅ Generated {len(dataset)} samples")
    print(f"   Road: {len(road_samples)}")
    print(f"   Garbage: {len(garbage_samples)}")
    print(f"   Water: {len(water_samples)}")
    print(f"   Electricity: {len(electricity_samples)}")
    print(f"   Other: {len(other_samples)}")
    print(f"✅ Saved to {output_path}")

if __name__ == "__main__":
    main()
