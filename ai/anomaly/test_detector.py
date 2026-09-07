from detector import detect_anomaly


normal = {
    "temperature": 76,
    "vibration": 0.32,
    "load": 72,
    "rpm": 1500,
    "fuel_rate": 15
}


anomaly = {
    "temperature": 96,
    "vibration": 0.85,
    "load": 94,
    "rpm": 1400,
    "fuel_rate": 22
}


print("NORMAL:")
print(detect_anomaly(normal))

print("\nANOMALY:")
print(detect_anomaly(anomaly))