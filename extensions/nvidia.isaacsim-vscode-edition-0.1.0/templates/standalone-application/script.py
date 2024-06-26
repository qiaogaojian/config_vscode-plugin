# Check out the standalone examples for more details on different implementations
# - Linux: ~/.local/share/ov/pkg/isaac_sim-xxxx.x.x/standalone_examples
# - Windows: %userprofile%\AppData\Local\ov\pkg\isaac_sim-xxxx.x.x\standalone_examples
# - Container: /isaac-sim/standalone_examples

# Import and launch the Omniverse Toolkit before any other imports.
# Note: Omniverse loads various plugins at runtime which
# cannot be imported unless the Toolkit is already running.
from isaacsim import SimulationApp

# See DEFAULT_LAUNCHER_CONFIG for available configuration
# https://docs.omniverse.nvidia.com/py/isaacsim/source/extensions/omni.isaac.kit/docs/index.html
launch_config = {"headless": False}
# Launch the Toolkit
simulation_app = SimulationApp(launch_config)

# Locate any other import statement after this point
${1:import omni}

for i in range(100):
    simulation_app.update()

# Close the running Toolkit
simulation_app.close()
