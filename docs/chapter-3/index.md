---
sidebar_position: 1
title: Perception & Sensing
description: How robots see, feel, and understand their environment through sensors and perception algorithms
---

# Perception & Sensing

For a robot to interact meaningfully with the physical world, it must first understand that world. Perception is the bridge between raw sensor data and actionable knowledge. In this chapter, we explore how humanoid robots perceive their environment and themselves.

## The Perception Challenge

Human perception seems effortless. We glance at a cluttered desk and immediately understand what's there—a coffee mug, some papers, a laptop. We reach for objects without consciously calculating distances. We navigate crowded spaces without thinking about obstacle avoidance.

For robots, none of this is automatic. Every aspect of perception must be explicitly computed from noisy, incomplete sensor data. The robot must:

1. **Capture** raw sensor data (images, depth measurements, forces)
2. **Process** this data to extract meaningful features
3. **Interpret** the features to understand objects and scenes
4. **Track** how the environment changes over time
5. **Integrate** multiple sensor modalities into a coherent world model

## Visual Perception

Vision provides rich information about the environment and is the primary sensing modality for many humanoid robots.

### Camera Systems

Modern humanoid robots typically employ multiple camera types:

**RGB Cameras**: Standard color cameras capture appearance information. Used for object recognition, reading text, and understanding scenes. Resolution ranges from 720p to 4K, with frame rates of 30-120 fps.

**Stereo Cameras**: Pairs of cameras that enable depth perception through triangulation, similar to human binocular vision. Effective for obstacles at medium range but less accurate at longer distances.

**Wide-Angle Cameras**: Fisheye or wide-angle lenses provide situational awareness, capturing more of the environment for navigation and safety monitoring.

### Depth Sensing Technologies

Depth sensors directly measure distances to objects:

**Structured Light**: Projects a known pattern (often infrared dots) onto the scene. By analyzing pattern distortion, the sensor computes depth. Works well indoors but struggles in sunlight.

**Time-of-Flight (ToF)**: Measures how long light takes to travel to objects and back. Provides fast, accurate depth at moderate resolution. Used in many mobile devices.

**LiDAR**: Uses laser scanning to create precise 3D point clouds. Expensive but highly accurate, effective at long range, and works in any lighting condition.

### Visual Processing Pipeline

Raw images must be processed to extract useful information:

**Object Detection**: Neural networks identify and locate objects in images. Modern detectors can recognize hundreds of object categories in real-time.

**Instance Segmentation**: Determines which pixels belong to each object, enabling precise object boundaries even when objects overlap.

**Pose Estimation**: Determines the 6D pose (position and orientation) of known objects, essential for manipulation tasks.

**Scene Understanding**: Higher-level reasoning about spatial relationships, room types, and navigable areas.

## Depth and 3D Perception

Understanding three-dimensional space is fundamental for physical interaction.

### Point Cloud Processing

Depth sensors produce point clouds—collections of 3D points representing visible surfaces. Processing these clouds involves:

**Registration**: Aligning point clouds from different viewpoints to build complete 3D models.

**Filtering**: Removing noise, outliers, and artifacts from the data.

**Segmentation**: Grouping points that belong to the same object or surface.

**Surface Reconstruction**: Converting point clouds into continuous surface representations.

### Occupancy Mapping

Robots need to understand where they can and cannot move. Occupancy maps represent the environment as a 3D grid where each cell is marked as:
- **Occupied**: Contains an obstacle
- **Free**: Safe for the robot to occupy
- **Unknown**: Not yet observed

These maps update continuously as the robot explores and the environment changes.

## Force and Tactile Sensing

Vision alone isn't sufficient for physical interaction. Contact forces are essential for manipulation.

### Force/Torque Sensors

Six-axis force/torque sensors measure forces and torques in all directions. Typically mounted at wrists and ankles, they enable:

- Detecting contact with objects and surfaces
- Controlling grasp forces during manipulation
- Feeling ground reaction forces during walking
- Compliant interaction with humans and environments

### Tactile Arrays

Advanced fingertip sensors provide spatially distributed touch information:

**Capacitive Arrays**: Detect pressure changes through capacitance variation. Robust and reliable.

**Resistive Arrays**: Measure pressure through resistance changes. Simple and cost-effective.

**Optical Tactile Sensors**: Use cameras to observe deformation of a soft membrane. High resolution but complex.

Tactile sensing enables:
- Detecting object slip during grasping
- Recognizing object texture and material properties
- Exploring objects through touch
- Ensuring safe grasp forces on delicate objects

## Proprioception: Body Awareness

Proprioception—the sense of body position and movement—is essential for coordinated motion.

### Joint State Sensing

Encoders at each joint measure:
- **Position**: The current angle of the joint
- **Velocity**: How fast the joint is moving
- **Torque**: The force being applied (often estimated from motor current)

High-quality joint sensing enables precise control and detecting unexpected contacts.

### Inertial Sensing

Inertial Measurement Units (IMUs) combine:

**Accelerometers**: Measure linear acceleration in three axes. Used to sense gravity direction and detect impacts.

**Gyroscopes**: Measure angular velocity in three axes. Essential for tracking body orientation.

By fusing accelerometer and gyroscope data, robots maintain accurate estimates of body orientation even during dynamic movement.

## Sensor Fusion

Real perception requires combining information from multiple sensors.

### Multi-Modal Integration

Each sensor type has strengths and weaknesses:
- Cameras provide rich appearance but no direct depth
- Depth sensors give geometry but miss color and texture
- Touch sensors work only at contact points

Sensor fusion combines these modalities to overcome individual limitations. A robot might use vision to locate an object, depth sensing to plan an approach, and tactile sensing to verify grasp success.

### Temporal Fusion

Sensors capture the world at different rates and with different latencies. Temporal fusion:
- Synchronizes data from different sensors
- Smooths noisy measurements over time
- Predicts sensor readings between measurements
- Handles sensor failures gracefully

Kalman filters and their variants are commonly used for temporal fusion, providing optimal estimates given noisy sensor data.

## State Estimation

Combining all available sensing, the robot must estimate its complete state:

### Body State Estimation

What is the robot's current configuration?
- Joint positions and velocities
- Body orientation and angular velocity
- Base position and linear velocity (when moving)

This estimation fuses joint encoders, IMU data, and sometimes visual odometry.

### World State Estimation

What is the state of the environment?
- Object positions and poses
- Dynamic obstacles and their trajectories
- Ground surface properties
- Human positions and activities

This estimation combines visual perception, depth sensing, and prior knowledge about the environment.

## Perception in Practice

Several practical considerations affect real-world perception:

### Computational Constraints

Perception algorithms must run in real-time. This requires careful algorithm selection and optimization. GPUs have become essential for running deep learning perception models at acceptable speeds.

### Lighting and Environmental Conditions

Perception must work across diverse conditions:
- Bright sunlight to dim indoor lighting
- Clean environments to dusty industrial settings
- Static scenes to fast-moving objects

Robust systems combine multiple sensor modalities to handle varying conditions.

### Calibration and Maintenance

Sensors must be carefully calibrated:
- Camera intrinsics and extrinsics
- Depth sensor accuracy
- Force sensor zeros and gains

Regular recalibration ensures perception accuracy over time.

---

**Next**: In Chapter 4, we'll explore motion and control—how robots use their perception to move through the world with precision and grace.
