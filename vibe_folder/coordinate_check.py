
import random
import math

# Constants for Otaniemi, Espoo
OTANIEMI_LAT = 60.18414
OTANIEMI_LON = 24.830084
EARTH_RADIUS = 6371000  # Earth's radius in meters

def generate_coordinates(num_coordinates=1000, area_half_side=500):
    """Generates a list of random (latitude, longitude) coordinates within a square area around Otaniemi."""
    coordinates = []
    for _ in range(num_coordinates):
        # Generate random offsets in meters
        delta_north = random.uniform(-area_half_side, area_half_side)
        delta_east = random.uniform(-area_half_side, area_half_side)

        # Convert meter offsets to degrees
        new_lat = OTANIEMI_LAT + (delta_north / EARTH_RADIUS) * (180 / math.pi)
        new_lon = OTANIEMI_LON + (delta_east / (EARTH_RADIUS * math.cos(math.radians(OTANIEMI_LAT)))) * (180 / math.pi)
        coordinates.append((new_lat, new_lon))
    return coordinates

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculates the great-circle distance between two points on the Earth's surface using the Haversine formula."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS * c

def get_user_input(area_half_side=500):
    """Gets valid latitude and longitude input from the user within the approximate area."""
    # Approximate bounds for user input validation (rough square km around Otaniemi)
    # These are illustrative; more precise validation would convert meter offsets to degree offsets
    approx_lat_min = OTANIEMI_LAT - (area_half_side / EARTH_RADIUS) * (180 / math.pi) * 1.1
    approx_lat_max = OTANIEMI_LAT + (area_half_side / EARTH_RADIUS) * (180 / math.pi) * 1.1
    approx_lon_min = OTANIEMI_LON - (area_half_side / (EARTH_RADIUS * math.cos(math.radians(OTANIEMI_LAT)))) * (180 / math.pi) * 1.1
    approx_lon_max = OTANIEMI_LON + (area_half_side / (EARTH_RADIUS * math.cos(math.radians(OTANIEMI_LAT)))) * (180 / math.pi) * 1.1

    while True:
        try:
            user_lat = float(input(f"Enter your Latitude (approx between {approx_lat_min:.4f} and {approx_lat_max:.4f}): "))
            user_lon = float(input(f"Enter your Longitude (approx between {approx_lon_min:.4f} and {approx_lon_max:.4f}): "))

            # Simple validation to ensure user input is somewhat near the area of interest
            if (approx_lat_min <= user_lat <= approx_lat_max and
                approx_lon_min <= user_lon <= approx_lon_max):
                return (user_lat, user_lon)
            else:
                print("Coordinates are outside the approximate 1 square km area. Please try again.")
        except ValueError:
            print("Invalid input. Please enter numeric values for coordinates.")

def main():
    area_half_side = 500  # Half side of a 1km x 1km square, in meters
    min_distance = 100
    max_distance = 500

    print(f"Generating a list of coordinates within a 1 square km area centered around Otaniemi (Lat: {OTANIEMI_LAT}, Lon: {OTANIEMI_LON})...")
    all_coordinates = generate_coordinates(area_half_side=area_half_side)
    print(f"Generated {len(all_coordinates)} coordinates.")

    user_lat, user_lon = get_user_input(area_half_side=area_half_side)
    print(f"You entered: Latitude {user_lat}, Longitude {user_lon}")

    suitable_coordinates = []
    for lat, lon in all_coordinates:
        dist = calculate_distance(user_lat, user_lon, lat, lon)
        if min_distance <= dist <= max_distance:
            suitable_coordinates.append((lat, lon, dist))

    if len(suitable_coordinates) >= 3:
        print(f"Found {len(suitable_coordinates)} coordinates between {min_distance} and {max_distance} meters away.")
        # Sort by distance and pick the first 3 or randomly sample
        random.shuffle(suitable_coordinates)
        random_three = suitable_coordinates[:3] # Take the first 3 after shuffling

        print("Here are 3 random coordinates between 100 and 500 meters away from your input:")
        for i, (lat, lon, dist) in enumerate(random_three):
            print(f"{i+1}: Latitude {lat:.6f}, Longitude {lon:.6f} (Distance: {dist:.2f}m)")
    else:
        print(f"Could not find 3 coordinates between {min_distance} and {max_distance} meters away.")
        print(f"Only found {len(suitable_coordinates)} suitable coordinates.")

if __name__ == "__main__":
    main()
