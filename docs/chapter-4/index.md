---
sidebar_position: 1
title: Motion & Control
description: Making robots move naturally and precisely through walking, grasping, and whole-body coordination
---

# Motion & Control

Perception tells a robot about the world. Motion and control enable it to act in that world. This chapter explores how humanoid robots achieve the remarkable feat of coordinated physical movement—from staying balanced while walking to precisely manipulating delicate objects.

## The Control Problem

Controlling a humanoid robot is fundamentally challenging because:

1. **High Dimensionality**: With 30+ joints, the robot has a vast space of possible configurations
2. **Underactuation**: The robot cannot directly control its base position—it must move by pushing against the ground
3. **Dynamics**: Gravity and inertia constantly affect the robot; standing still requires active control
4. **Uncertainty**: The robot never knows its exact state or how its actions will affect the world

Despite these challenges, modern humanoid robots achieve impressive levels of physical capability through sophisticated control algorithms.

## Balancing and Posture Control

Before a humanoid robot can do anything else, it must stay upright.

### Center of Mass and Support Polygon

Balance fundamentals rely on physics:

**Center of Mass (CoM)**: The point where the robot's mass is effectively concentrated. For a humanoid, this is roughly at hip height.

**Support Polygon**: The convex hull of ground contact points. When standing on two feet, it's roughly a rectangle. On one foot, it's the foot outline.

For static stability, the CoM projected onto the ground must stay within the support polygon. Dynamic movement allows temporary excursions outside this region, as long as the robot takes corrective action.

### Zero Moment Point (ZMP)

The ZMP is where the sum of ground reaction forces acts. For stable walking, the ZMP must remain within the support polygon. ZMP-based control has been fundamental to humanoid walking for decades.

### Model Predictive Control

Modern balance control often uses Model Predictive Control (MPC):
1. Predict future robot states over a time horizon
2. Optimize control actions to minimize a cost function
3. Apply the first action, then repeat

MPC can anticipate balance disturbances and take preemptive action, rather than merely reacting to errors.

## Walking and Locomotion

Walking is a controlled falling process—the robot tips forward, catches itself with the swing leg, and repeats.

### Gait Phases

Walking involves alternating phases:

**Double Support**: Both feet on ground. Most stable phase. Used for weight transfer.

**Single Support**: One foot lifting. Center of mass shifts over stance foot. Most challenging for balance.

**Swing**: Moving the lifted foot forward. Must avoid obstacles and prepare for ground contact.

**Impact**: Foot touches down. Forces can be large; must be controlled carefully.

### Trajectory Generation

Walking trajectories must be planned for:
- **CoM trajectory**: How the body moves through space
- **Foot placement**: Where each step lands
- **Swing foot trajectory**: The path of the moving foot
- **Arm motion**: For balance assistance and natural appearance

Traditional approaches use mathematical formulations of stable walking. Newer methods learn walking behaviors from examples or optimization.

### Terrain Adaptation

Real-world walking requires adapting to varied terrain:

**Stairs**: Detecting step height and adjusting leg trajectories
**Slopes**: Modifying body posture to maintain balance
**Rough Ground**: Compliant control to handle unexpected variations
**Obstacles**: Planning paths around or over barriers

Robust walking combines perception (sensing the terrain) with reactive control (adjusting to unexpected contacts).

## Manipulation

Manipulating objects requires coordinating arm motion, hand control, and body positioning.

### Inverse Kinematics

To reach a target position, the robot must compute the required joint angles. This inverse kinematics problem involves:

**Forward Kinematics**: Given joint angles, compute end-effector (hand) position. Straightforward geometry.

**Inverse Kinematics**: Given desired end-effector position, compute joint angles. Often has multiple solutions or no solution.

Numerical methods like the Jacobian pseudoinverse iteratively solve inverse kinematics in real-time.

### Motion Planning

Moving from one configuration to another safely requires planning:

**Configuration Space**: The space of all possible joint angles. Obstacles map into forbidden regions.

**Path Planning**: Finding a collision-free path through configuration space.

**Trajectory Planning**: Adding timing to the path—velocities and accelerations that respect robot limits.

Algorithms like RRT (Rapidly-exploring Random Trees) efficiently search high-dimensional spaces to find viable paths.

### Grasping

Grasping involves:

1. **Grasp Planning**: Determining where and how to grasp the object
2. **Approach Motion**: Moving the hand to pre-grasp position
3. **Closing**: Finger motion to achieve stable contact
4. **Lifting**: Raising the object while maintaining grasp

Grasp planning must consider:
- Object geometry and mass distribution
- Surface properties (friction, fragility)
- Task requirements (what will be done with the object)
- Hand capabilities and limitations

### Force Control

Many manipulation tasks require controlling forces, not just positions:

**Position Control**: Move to a specific location regardless of forces encountered
**Force Control**: Apply a specific force regardless of position
**Impedance Control**: Behave like a spring—position-dependent force

Force control enables:
- Inserting pegs into holes (force during contact)
- Polishing surfaces (constant pressure)
- Handling fragile objects (force limits)
- Safe human interaction (yielding to contact)

## Whole-Body Control

Humanoid robots excel when coordinating their entire body.

### Task Prioritization

Multiple tasks often compete for the same joints. A priority scheme resolves conflicts:

**Primary Tasks**: Must be achieved (e.g., not falling)
**Secondary Tasks**: Achieved if possible without affecting primary tasks
**Tertiary Tasks**: Achieved in remaining freedom

For example: Balance is primary; reaching a target is secondary; minimizing joint torques is tertiary.

### Null Space Motion

When a task doesn't fully constrain the robot, extra freedom exists (the "null space"). This freedom can be used for secondary objectives:
- Moving the center of mass for better balance
- Avoiding joint limits
- Preparing for upcoming tasks
- Natural-looking postures

### Momentum-Based Control

Advanced controllers reason about the robot's momentum:

**Linear Momentum**: Mass times velocity; relates to translation
**Angular Momentum**: Resistance to rotational change; relates to balance

By controlling momentum rather than just positions, robots achieve more dynamic, athletic movements.

## Dynamic Motion

Beyond careful walking and reaching, robots can perform dynamic movements.

### Running and Jumping

Dynamic locomotion involves flight phases where no feet contact ground:
- Higher speeds than walking
- Greater energy efficiency at high speeds
- Ability to cross gaps and obstacles

These movements require accurate timing and sufficient joint power.

### Throwing and Catching

Dynamic manipulation involves releasing or acquiring objects at speed:
- Precise timing of release
- Prediction of object trajectory
- Fast reactive grasping

### Impact and Recovery

Dynamic robots must handle impacts:
- Landing from jumps
- Unexpected collisions
- Catching heavy objects

This requires compliant control that absorbs energy and regains stability.

## Control Implementation

Control algorithms must run reliably on robot hardware.

### Control Frequencies

Different control loops run at different rates:

**Motor Control**: 5,000-10,000 Hz. Manages electrical currents.
**Joint Control**: 1,000 Hz. Manages joint positions and torques.
**Whole-Body Control**: 200-500 Hz. Coordinates full body motion.
**Planning**: 10-50 Hz. Generates new plans and behaviors.

Higher-level controllers command lower-level controllers in a cascade.

### Real-Time Constraints

Control code must execute reliably within fixed time bounds. Missing a deadline can cause:
- Jerky motion
- Instability
- Safety hazards

Real-time operating systems and careful programming ensure timing guarantees.

### Safety Systems

Multiple layers protect against control failures:
- Software limits on joint positions, velocities, and torques
- Hardware safety stops for critical situations
- Watchdog timers that halt the robot if control stops
- Force limiting during human interaction

---

**Next**: In Chapter 5, we'll explore learning and adaptation—how robots improve their skills through experience and learn new capabilities.
