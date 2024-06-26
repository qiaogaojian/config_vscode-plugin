import inspect
import json
import os
import re
import subprocess
from types import FunctionType

from pxr import Sdf

HIDE_OPTIONAL_ARGS = True
HIDE_ANNOTATION_COMMENT = True
SINGLE_LINE_SNIPPET = True
INCLUDE_TABSTOPS = False

SAVE_PATH = os.path.abspath(
    os.path.join(
        os.getcwd(),
        "..",
        "..",
        "..",
        "source",
        "extensions",
        "omni.isaac.vscode",
        "ext-vscode",
        "omniverse-vscode-edition",
        "snippets",
    )
)
if not os.path.isdir(SAVE_PATH):
    SAVE_PATH = ""
print("saving at:", SAVE_PATH)


def rst_to_markdown(string):
    def detect_indentation(string):
        match = re.search(r"\n(\s*)", string)
        if match:
            whitespace = match.group(1).count(" ")
            return whitespace
        return 0

    if not string:
        return ""

    # format string (.rst)
    indentation = detect_indentation(string)
    if indentation:
        string = string.replace("\n" + " " * indentation, "\n")
    string = re.sub("\.{2}\swarning:{2}\s+", "*Warning:* \n", string)
    string = re.sub("\.{2}\snote:{2}\s+", "*Note:* \n", string)
    string = re.sub("\.{2}\shint:{2}\s+", "*Hint:* \n", string)
    string = re.sub("\n[' ']{8,}", " ", string)

    matches = re.findall(r"\n[' ']{4}[a-z|A-Z|0-9|\\_]+\s+\(.*\):", string)
    for match in matches:
        arg = match.split(" (")[0][5:]
        string = string.replace(f"\n    {arg} (", f"\n * ``{arg}`` (")

    # convert
    pandoc_command = ["pandoc", "-f", "rst", "-t", "markdown_mmd", "--wrap=preserve"]
    result = subprocess.run(pandoc_command, input=string, capture_output=True, text=True)
    # check if the conversion was successful
    if result.returncode == 0:
        # format string (.md)
        string = result.stdout
        string = string.replace("Args:\n\n:   ", "**Args:**\n\n    ")
        string = string.replace("Returns:\n\n:   ", "**Returns:**\n\n * ")
        string = string.replace("Raises:\n\n:   ", "**Raises:**\n\n * ")
        string = string.replace("Example:\n\n", "---\n**Example:**\n\n")
        string = string.replace("``` python", "```python")
        string = string.replace("    -   ", " * ").replace("> -   ", " * ")
        string = string.replace("$", "`")
        return string
    else:
        raise RuntimeError(f"Failed to convert to Markdown: {result.stderr}")


def args_annotations(obj):
    signature = inspect.signature(obj)

    # arguments
    args = []
    annotations = []
    for i, parameter in enumerate(signature.parameters.values()):
        if parameter.name in ["self", "args", "kwargs"]:
            continue
        # positional arguments
        if type(parameter.default) == type(inspect.Parameter.empty):
            if INCLUDE_TABSTOPS:
                args.append(f"{parameter.name}=${{{i + 1}:{parameter.name}}}")
            else:
                args.append(f"{parameter.name}={parameter.name}")
        elif HIDE_OPTIONAL_ARGS:
            continue
        # optional arguments
        else:
            default_value = parameter.default
            if type(parameter.default) is str:
                default_value = '"{}"'.format(parameter.default)
            elif type(parameter.default) is Sdf.Path:
                if parameter.default == Sdf.Path.emptyPath:
                    default_value = "Sdf.Path.emptyPath"
                else:
                    default_value = 'Sdf.Path("{}")'.format(parameter.default)
            elif inspect.isclass(parameter.default):
                default_value = class_fullname(parameter.default)
            args.append("{}={}".format(parameter.name, default_value))
        # argument annotation
        if parameter.annotation == inspect.Parameter.empty:
            annotations.append("")
        else:
            annotations.append(class_fullname(parameter.annotation))

    # return value
    return_val = signature.return_annotation
    return_val = class_fullname(return_val) if return_val != type(inspect.Signature.empty) else "None"
    return_val = "" if return_val in ["inspect._empty", "None"] else return_val

    return args, annotations, return_val


def class_fullname(c):
    try:
        module = c.__module__
        if module == "builtins":
            return c.__name__
        return module + "." + c.__name__
    except:
        return str(c)


def get_class(klass, object_name):

    class_name = klass.__qualname__
    args, annotations, _ = args_annotations(klass.__init__)

    # arguments
    spaces = len(object_name) + 3 + len(class_name) + 1
    arguments_as_string = "" if args else ")"
    for i, arg, annotation in zip(range(len(args)), args, annotations):
        k = 0 if SINGLE_LINE_SNIPPET or not i else 1
        is_last = i >= len(args) - 1
        if annotation and not HIDE_ANNOTATION_COMMENT:
            arguments_as_string += " " * k * spaces + "{}{}".format(
                arg, ")  # {}".format(annotation) if is_last else ",  # {}\n".format(annotation)
            )
        else:
            arguments_as_string += " " * k * spaces + "{}{}".format(
                arg, ")" if is_last else (", " if SINGLE_LINE_SNIPPET else ",\n")
            )

    description = rst_to_markdown(klass.__doc__)
    snippet = "{} = {}({}".format(object_name, class_name, arguments_as_string) + "\n"

    # register
    return {"title": class_name, "description": description, "snippet": snippet, "category": "class"}


def get_properties(klass, object_name):
    snippets = []
    property_names = sorted([x for x, y in klass.__dict__.items() if type(y) == property and not x.startswith("__")])

    for property_name in property_names:
        # ignore private and special properties
        if property_name.startswith("_") or property_name.startswith("__"):
            continue

        return_var_name = f"${{0:{property_name}}} = " if INCLUDE_TABSTOPS else f"{property_name} = "
        description = rst_to_markdown(klass.__dict__[property_name].__doc__)
        snippet = "{}{}.{}".format(return_var_name, object_name, property_name) + "\n"

        # register
        snippets.append(
            {"title": property_name, "description": description, "snippet": snippet, "category": "property"}
        )

    return sorted(snippets, key=lambda x: x["title"])


def get_methods(klass, object_name):
    snippets = []
    method_names = sorted([x for x, y in klass.__dict__.items() if type(y) == FunctionType and not x.startswith("__")])
    for method_name in method_names:
        # ignore private and special methods
        if method_name.startswith("_") or method_name.startswith("__"):
            continue

        args, annotations, return_val = args_annotations(klass.__dict__[method_name])

        # return value
        return_var_name = ""
        if return_val:
            if method_name.startswith("get_"):
                return_var_name = method_name[4:] + " = "
            else:
                return_var_name = r"${0:value} = " if INCLUDE_TABSTOPS else "value = "

        # arguments
        spaces = len(return_var_name) + len(object_name) + 1 + len(method_name) + 1
        arguments_as_string = "" if args else ")"
        for i, arg, annotation in zip(range(len(args)), args, annotations):
            k = 0 if SINGLE_LINE_SNIPPET or not i else 1
            is_last = i >= len(args) - 1
            if annotation and not HIDE_ANNOTATION_COMMENT:
                arguments_as_string += " " * k * spaces + "{}{}".format(
                    arg, ")  # {}".format(annotation) if is_last else ",  # {}\n".format(annotation)
                )
            else:
                arguments_as_string += " " * k * spaces + "{}{}".format(
                    arg, ")" if is_last else (", " if SINGLE_LINE_SNIPPET else ",\n")
                )

        if return_val:
            snippet = "{}{}.{}({}".format(return_var_name, object_name, method_name, arguments_as_string) + "\n"
        else:
            snippet = "{}.{}({}".format(object_name, method_name, arguments_as_string) + "\n"

        # register
        description = rst_to_markdown(klass.__dict__[method_name].__doc__)
        snippets.append({"title": method_name, "description": description, "snippet": snippet, "category": "method"})

    return sorted(snippets, key=lambda x: x["title"])


def get_functions(module, module_name, exclude_functions=[]):
    snippets = []
    for function in inspect.getmembers(module, inspect.isfunction):
        function_name = function[0]

        # ignore private and special functions
        if function_name.startswith("_") or function_name.startswith("__"):
            continue
        # ignore exclude functions
        if function_name in exclude_functions:
            continue
        # ignore functions not defined in current module
        if inspect.getmodule(eval(f"{module.__name__}.{function_name}")) != module:
            continue

        args, annotations, return_val = args_annotations(function[1])

        # return value
        return_var_name = ""
        if return_val:
            return_var_name = r"${0:value} = " if INCLUDE_TABSTOPS else "value = "

        # arguments
        spaces = len(return_var_name) + len(module_name) + 1 + len(function_name) + 1
        arguments_as_string = "" if args else ")"
        for i, arg, annotation in zip(range(len(args)), args, annotations):
            k = 0 if SINGLE_LINE_SNIPPET or not i else 1
            is_last = i >= len(args) - 1
            if annotation and not HIDE_ANNOTATION_COMMENT:
                arguments_as_string += " " * k * spaces + "{}{}".format(
                    arg, ")  # {}".format(annotation) if is_last else ",  # {}\n".format(annotation)
                )
            else:
                arguments_as_string += " " * k * spaces + "{}{}".format(
                    arg, ")" if is_last else (", " if SINGLE_LINE_SNIPPET else ",\n")
                )

        if return_val:
            snippet = "{}{}.{}({}".format(return_var_name, module_name, function_name, arguments_as_string) + "\n"
        else:
            snippet = "{}.{}({}".format(module_name, function_name, arguments_as_string) + "\n"

        # register
        description = rst_to_markdown(function[1].__doc__)
        snippets.append(
            {"title": function_name, "description": description, "snippet": snippet, "category": "function"}
        )

    return sorted(snippets, key=lambda x: x["title"])


# auxiliary functions


def generate_class(klass, bases=[], object_name=None, import_statement="", title=None):
    def camel_to_snake(string):
        return "".join([f"_{c}" if c.isupper() else c for c in string]).lstrip("_").lower()

    snippets = []
    im = {
        "title": "import ...",
        "description": "Import class",
        "snippet": f"{import_statement}\n",
        "category": "import",
    }
    if not object_name:
        object_name = camel_to_snake(klass.__qualname__)
    s0 = get_class(klass, object_name)
    snippets += get_properties(klass, object_name)
    snippets += get_methods(klass, object_name)
    for base in bases:
        snippets += get_methods(base, object_name)
    return {
        "title": title if title else klass.__qualname__,
        "snippets": [im, s0] + sorted(snippets, key=lambda x: x["title"]),
    }


# ========================================
# CORE
# ========================================
from omni.isaac.core.articulations import Articulation, ArticulationGripper, ArticulationSubset, ArticulationView
from omni.isaac.core.controllers import ArticulationController, BaseController, BaseGripperController
from omni.isaac.core.loggers import DataLogger
from omni.isaac.core.materials import (
    DeformableMaterial,
    DeformableMaterialView,
    OmniGlass,
    OmniPBR,
    ParticleMaterial,
    ParticleMaterialView,
    PhysicsMaterial,
    PreviewSurface,
    VisualMaterial,
)
from omni.isaac.core.objects import (
    DynamicCapsule,
    DynamicCone,
    DynamicCuboid,
    DynamicCylinder,
    DynamicSphere,
    FixedCapsule,
    FixedCone,
    FixedCuboid,
    FixedCylinder,
    FixedSphere,
    GroundPlane,
    VisualCapsule,
    VisualCone,
    VisualCuboid,
    VisualCylinder,
    VisualSphere,
)
from omni.isaac.core.physics_context import PhysicsContext
from omni.isaac.core.prims import (
    BaseSensor,
    ClothPrim,
    ClothPrimView,
    GeometryPrim,
    GeometryPrimView,
    ParticleSystem,
    ParticleSystemView,
    RigidContactView,
    RigidPrim,
    RigidPrimView,
    XFormPrim,
    XFormPrimView,
)
from omni.isaac.core.prims._impl.single_prim_wrapper import _SinglePrimWrapper
from omni.isaac.core.robots import Robot, RobotView
from omni.isaac.core.scenes import Scene, SceneRegistry
from omni.isaac.core.simulation_context import SimulationContext
from omni.isaac.core.tasks import BaseTask, FollowTarget, PickPlace, Stacking
from omni.isaac.core.world import World

snippets = []

# articulations
subsnippets = []
subsnippets.append(
    generate_class(
        Articulation, [_SinglePrimWrapper], import_statement="from omni.isaac.core.articulations import Articulation"
    )
)
subsnippets.append(
    generate_class(
        ArticulationGripper, [], import_statement="from omni.isaac.core.articulations import ArticulationGripper"
    )
)
subsnippets.append(
    generate_class(
        ArticulationSubset, [], import_statement="from omni.isaac.core.articulations import ArticulationSubset"
    )
)
subsnippets.append(
    generate_class(
        ArticulationView,
        [XFormPrimView],
        import_statement="from omni.isaac.core.articulations import ArticulationView",
    )
)
snippets.append({"title": "Articulations", "snippets": subsnippets})

# controllers
subsnippets = []
subsnippets.append(
    generate_class(
        ArticulationController,
        [],
        import_statement="from omni.isaac.core.controllers import ArticulationController",
    )
)
subsnippets.append(
    generate_class(
        BaseController,
        [],
        import_statement="from omni.isaac.core.controllers import BaseController",
    )
)
subsnippets.append(
    generate_class(
        BaseGripperController,
        [BaseController],
        import_statement="from omni.isaac.core.controllers import BaseGripperController",
    )
)
snippets.append({"title": "Controllers", "snippets": subsnippets})

# loggers
snippets.append(
    generate_class(
        DataLogger,
        [],
        import_statement="from omni.isaac.core.loggers import DataLogger",
    )
)

# materials
subsnippets = []
subsnippets.append(
    generate_class(
        DeformableMaterial,
        [],
        import_statement="from omni.isaac.core.materials import DeformableMaterial",
    )
)
subsnippets.append(
    generate_class(
        DeformableMaterialView,
        [],
        import_statement="from omni.isaac.core.materials import DeformableMaterialView",
    )
)
subsnippets.append(
    generate_class(
        OmniGlass,
        [VisualMaterial],
        import_statement="from omni.isaac.core.materials import OmniGlass",
    )
)
subsnippets.append(
    generate_class(
        OmniPBR,
        [VisualMaterial],
        import_statement="from omni.isaac.core.materials import OmniPBR",
    )
)
subsnippets.append(
    generate_class(
        ParticleMaterial,
        [],
        import_statement="from omni.isaac.core.materials import ParticleMaterial",
    )
)
subsnippets.append(
    generate_class(
        ParticleMaterialView,
        [],
        import_statement="from omni.isaac.core.materials import ParticleMaterialView",
    )
)
subsnippets.append(
    generate_class(
        PhysicsMaterial,
        [],
        import_statement="from omni.isaac.core.materials import PhysicsMaterial",
    )
)
subsnippets.append(
    generate_class(
        PreviewSurface,
        [VisualMaterial],
        import_statement="from omni.isaac.core.materials import PreviewSurface",
    )
)
subsnippets.append(
    generate_class(
        VisualMaterial,
        [],
        import_statement="from omni.isaac.core.materials import VisualMaterial",
    )
)
snippets.append({"title": "Materials", "snippets": subsnippets})

# objects
subsnippets = []
subsnippets.append(
    generate_class(
        DynamicCapsule,
        [RigidPrim, VisualCapsule, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import DynamicCapsule",
    )
)
subsnippets.append(
    generate_class(
        DynamicCone,
        [RigidPrim, VisualCone, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import DynamicCone",
    )
)
subsnippets.append(
    generate_class(
        DynamicCuboid,
        [RigidPrim, VisualCuboid, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import DynamicCuboid",
    )
)
subsnippets.append(
    generate_class(
        DynamicCylinder,
        [RigidPrim, VisualCylinder, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import DynamicCylinder",
    )
)
subsnippets.append(
    generate_class(
        DynamicSphere,
        [RigidPrim, VisualSphere, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import DynamicSphere",
    )
)
subsnippets.append(
    generate_class(
        FixedCapsule,
        [VisualCapsule, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import FixedCapsule",
    )
)
subsnippets.append(
    generate_class(
        FixedCone,
        [VisualCone, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import FixedCone",
    )
)
subsnippets.append(
    generate_class(
        FixedCuboid,
        [VisualCuboid, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import FixedCuboid",
    )
)
subsnippets.append(
    generate_class(
        FixedCylinder,
        [VisualCylinder, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import FixedCylinder",
    )
)
subsnippets.append(
    generate_class(
        FixedSphere,
        [VisualSphere, GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import FixedSphere",
    )
)
subsnippets.append(
    generate_class(
        GroundPlane,
        [],
        import_statement="from omni.isaac.core.objects import GroundPlane",
    )
)
subsnippets.append(
    generate_class(
        VisualCapsule,
        [GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import VisualCapsule",
    )
)
subsnippets.append(
    generate_class(
        VisualCone,
        [GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import VisualCone",
    )
)
subsnippets.append(
    generate_class(
        VisualCuboid,
        [GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import VisualCuboid",
    )
)
subsnippets.append(
    generate_class(
        VisualCylinder,
        [GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import VisualCylinder",
    )
)
subsnippets.append(
    generate_class(
        VisualSphere,
        [GeometryPrim, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.objects import VisualSphere",
    )
)
snippets.append({"title": "Objects", "snippets": subsnippets})

# physics_context
snippets.append(
    generate_class(
        PhysicsContext,
        [],
        import_statement="from omni.isaac.core.physics_context import PhysicsContext",
    )
)

# prims
subsnippets = []
subsnippets.append(
    generate_class(
        BaseSensor,
        [_SinglePrimWrapper],
        import_statement="from omni.isaac.core.prims import BaseSensor",
    )
)
subsnippets.append(
    generate_class(
        ClothPrim,
        [_SinglePrimWrapper],
        import_statement="from omni.isaac.core.prims import ClothPrim",
    )
)
subsnippets.append(
    generate_class(
        ClothPrimView,
        [XFormPrimView],
        import_statement="from omni.isaac.core.prims import ClothPrimView",
    )
)
subsnippets.append(
    generate_class(
        GeometryPrim,
        [_SinglePrimWrapper],
        import_statement="from omni.isaac.core.prims import GeometryPrim",
    )
)
subsnippets.append(
    generate_class(
        GeometryPrimView,
        [XFormPrimView],
        import_statement="from omni.isaac.core.prims import GeometryPrimView",
    )
)
subsnippets.append(
    generate_class(
        ParticleSystem,
        [],
        import_statement="from omni.isaac.core.prims import ParticleSystem",
    )
)
subsnippets.append(
    generate_class(
        ParticleSystemView,
        [],
        import_statement="from omni.isaac.core.prims import ParticleSystemView",
    )
)
subsnippets.append(
    generate_class(
        RigidContactView,
        [],
        import_statement="from omni.isaac.core.prims import RigidContactView",
    )
)
subsnippets.append(
    generate_class(
        RigidPrim,
        [_SinglePrimWrapper],
        import_statement="from omni.isaac.core.prims import RigidPrim",
    )
)
subsnippets.append(
    generate_class(
        RigidPrimView,
        [XFormPrimView],
        import_statement="from omni.isaac.core.prims import RigidPrimView",
    )
)
subsnippets.append(
    generate_class(
        XFormPrim,
        [_SinglePrimWrapper],
        object_name="xform_prim",
        import_statement="from omni.isaac.core.prims import XFormPrim",
    )
)
subsnippets.append(
    generate_class(
        XFormPrimView,
        [],
        object_name="xform_prim_view",
        import_statement="from omni.isaac.core.prims import XFormPrimView",
    )
)
snippets.append({"title": "Prims", "snippets": subsnippets})

# robots
subsnippets = []
subsnippets.append(
    generate_class(
        Robot,
        [Articulation, _SinglePrimWrapper],
        import_statement="from omni.isaac.core.robots import Robot",
    )
)
subsnippets.append(
    generate_class(
        RobotView,
        [ArticulationView, XFormPrimView],
        import_statement="from omni.isaac.core.robots import RobotView",
    )
)
snippets.append({"title": "Robots", "snippets": subsnippets})

# scenes
subsnippets = []
subsnippets.append(
    generate_class(
        Scene,
        [],
        import_statement="from omni.isaac.core.scenes import Scene",
    )
)
subsnippets.append(
    generate_class(
        SceneRegistry,
        [],
        import_statement="from omni.isaac.core.scenes import SceneRegistry",
    )
)
snippets.append({"title": "Scenes", "snippets": subsnippets})

# simulation_context
snippets.append(
    generate_class(
        SimulationContext,
        [],
        import_statement="from omni.isaac.core.simulation_context import SimulationContext",
    )
)

# world
snippets.append(
    generate_class(
        World,
        [SimulationContext],
        import_statement="from omni.isaac.core.world import World",
    )
)

# tasks
subsnippets = []
subsnippets.append(
    generate_class(
        BaseTask,
        [],
        import_statement="from omni.isaac.core.tasks import BaseTask",
    )
)
subsnippets.append(
    generate_class(
        FollowTarget,
        [BaseTask],
        import_statement="from omni.isaac.core.tasks import FollowTarget",
    )
)
subsnippets.append(
    generate_class(
        PickPlace,
        [BaseTask],
        import_statement="from omni.isaac.core.tasks import PickPlace",
    )
)
subsnippets.append(
    generate_class(
        Stacking,
        [BaseTask],
        import_statement="from omni.isaac.core.tasks import Stacking",
    )
)
snippets.append({"title": "Tasks", "snippets": subsnippets})

file_name = "python-isaac-sim-core.json"
file_path = os.path.join(SAVE_PATH, file_name) if SAVE_PATH else file_name
with open(file_path, "w") as f:
    json.dump(snippets, f, indent=0, separators=(",", ":"))

# ========================================
# CORE UTILS
# ========================================
snippets_core_utils = []

import omni.isaac.core.utils.bounds as bounds_utils
import omni.isaac.core.utils.carb as carb_utils
import omni.isaac.core.utils.collisions as collisions_utils
import omni.isaac.core.utils.constants as constants_utils
import omni.isaac.core.utils.distance_metrics as distance_metrics_utils
import omni.isaac.core.utils.extensions as extensions_utils
import omni.isaac.core.utils.math as math_utils
import omni.isaac.core.utils.mesh as mesh_utils
import omni.isaac.core.utils.nucleus as nucleus_utils
import omni.isaac.core.utils.numpy as numpy_utils
import omni.isaac.core.utils.numpy.maths as numpy_utils_maths
import omni.isaac.core.utils.numpy.rotations as numpy_utils_rotations
import omni.isaac.core.utils.numpy.tensor as numpy_utils_tensor
import omni.isaac.core.utils.numpy.transformations as numpy_utils_transformations
import omni.isaac.core.utils.physics as physics_utils
import omni.isaac.core.utils.prims as prims_utils
import omni.isaac.core.utils.random as random_utils
import omni.isaac.core.utils.render_product as render_product_utils
import omni.isaac.core.utils.rotations as rotations_utils
import omni.isaac.core.utils.semantics as semantics_utils
import omni.isaac.core.utils.stage as stage_utils
import omni.isaac.core.utils.string as string_utils
import omni.isaac.core.utils.torch as torch_utils
import omni.isaac.core.utils.torch.maths as torch_utils_maths
import omni.isaac.core.utils.torch.rotations as torch_utils_rotations
import omni.isaac.core.utils.torch.tensor as torch_utils_tensor
import omni.isaac.core.utils.torch.transformations as torch_utils_transformations
import omni.isaac.core.utils.transformations as transformations_utils
import omni.isaac.core.utils.types as types_utils
import omni.isaac.core.utils.viewports as viewports_utils
import omni.isaac.core.utils.warp as warp_utils
import omni.isaac.core.utils.warp.rotations as warp_utils_rotations
import omni.isaac.core.utils.warp.tensor as warp_utils_tensor
import omni.isaac.core.utils.warp.transformations as warp_utils_transformations
import omni.isaac.core.utils.xforms as xforms_utils

# bounds_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.bounds as bounds_utils\n",
        "category": "import",
    }
]
s0 = get_functions(bounds_utils, "bounds_utils")
snippets_core_utils.append({"title": "Bounds", "snippets": im + s0})

# carb_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.carb as carb_utils\n",
        "category": "import",
    }
]
s0 = get_functions(carb_utils, "carb_utils")
snippets_core_utils.append({"title": "Carb", "snippets": im + s0})

# collisions_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.collisions as collisions_utils\n",
        "category": "import",
    }
]
s0 = get_functions(collisions_utils, "collisions_utils")
snippets_core_utils.append({"title": "Collisions", "snippets": im + s0})

# constants_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.constants as constants_utils\n",
        "category": "import",
    }
]
s0 = get_functions(constants_utils, "constants_utils")
snippets_core_utils.append(
    {
        "title": "Constants",
        "snippets": im
        + [
            {
                "title": "AXES_INDICES",
                "description": "Mapping from axis name to axis ID",
                "snippet": "constants_utils.AXES_INDICES\n",
                "category": "constant",
            },
            {
                "title": "AXES_TOKEN",
                "description": "Mapping from axis name to axis USD token",
                "snippet": "constants_utils.AXES_TOKEN\n",
                "category": "constant",
            },
        ],
    }
)

# distance_metrics_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.distance_metrics as distance_metrics_utils\n",
        "category": "import",
    }
]
s0 = get_functions(distance_metrics_utils, "distance_metrics_utils")
snippets_core_utils.append({"title": "Distance Metrics", "snippets": im + s0})

# extensions_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.extensions as extensions_utils\n",
        "category": "import",
    }
]
s0 = get_functions(extensions_utils, "extensions_utils")
snippets_core_utils.append({"title": "Extensions", "snippets": im + s0})

# math_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.math as math_utils\n",
        "category": "import",
    }
]
s0 = get_functions(math_utils, "math_utils")
snippets_core_utils.append({"title": "Math", "snippets": im + s0})

# mesh_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.mesh as mesh_utils\n",
        "category": "import",
    }
]
s0 = get_functions(mesh_utils, "mesh_utils")
snippets_core_utils.append({"title": "Mesh", "snippets": im + s0})

# nucleus_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.nucleus as nucleus_utils\n",
        "category": "import",
    }
]
s0 = get_functions(nucleus_utils, "nucleus_utils")
snippets_core_utils.append({"title": "Nucleus", "snippets": im + s0})

# numpy_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.numpy as numpy_utils\n",
        "category": "import",
    }
]
s0 = get_functions(numpy_utils, "numpy_utils")
s1 = get_functions(numpy_utils_maths, "numpy_utils")
s2 = get_functions(numpy_utils_rotations, "numpy_utils")
s3 = get_functions(numpy_utils_tensor, "numpy_utils")
s4 = get_functions(numpy_utils_transformations, "numpy_utils")
snippets_core_utils.append(
    {"title": "Numpy", "snippets": im + sorted(s0 + s1 + s2 + s3 + s4, key=lambda x: x["title"])}
)

# physics_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.physics as physics_utils\n",
        "category": "import",
    }
]
s0 = get_functions(physics_utils, "physics_utils")
snippets_core_utils.append({"title": "Physics", "snippets": im + s0})

# prims_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.prims as prims_utils\n",
        "category": "import",
    }
]
s0 = get_functions(prims_utils, "prims_utils")
snippets_core_utils.append({"title": "Prims", "snippets": im + s0})

# random_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.random as random_utils\n",
        "category": "import",
    }
]
s0 = get_functions(random_utils, "random_utils")
snippets_core_utils.append({"title": "Random", "snippets": im + s0})

# render_product_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.render_product as render_product_utils\n",
        "category": "import",
    }
]
s0 = get_functions(render_product_utils, "render_product_utils")
snippets_core_utils.append({"title": "Render Product", "snippets": im + s0})

# rotations_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.rotations as rotations_utils\n",
        "category": "import",
    }
]
s0 = get_functions(rotations_utils, "rotations_utils")
snippets_core_utils.append({"title": "Rotations", "snippets": im + s0})

# semantics_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.semantics as semantics_utils\n",
        "category": "import",
    }
]
s0 = get_functions(semantics_utils, "semantics_utils")
snippets_core_utils.append({"title": "Semantics", "snippets": im + s0})

# stage_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.stage as stage_utils\n",
        "category": "import",
    }
]
s0 = get_functions(stage_utils, "stage_utils")
snippets_core_utils.append({"title": "Stage", "snippets": im + s0})

# string_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.string as string_utils\n",
        "category": "import",
    }
]
s0 = get_functions(string_utils, "string_utils")
snippets_core_utils.append({"title": "String", "snippets": im + s0})

# transformations_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.transformations as transformations_utils\n",
        "category": "import",
    }
]
s0 = get_functions(transformations_utils, "transformations_utils")
snippets_core_utils.append({"title": "Transformations", "snippets": im + s0})

# torch_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.torch as torch_utils\n",
        "category": "import",
    }
]
s0 = get_functions(torch_utils, "torch_utils")
s1 = get_functions(torch_utils_maths, "torch_utils")
s2 = get_functions(torch_utils_rotations, "torch_utils")
s3 = get_functions(torch_utils_tensor, "torch_utils")
s4 = get_functions(torch_utils_transformations, "torch_utils")
snippets_core_utils.append(
    {"title": "Torch", "snippets": im + sorted(s0 + s1 + s2 + s3 + s4, key=lambda x: x["title"])}
)

# types_utils
subsnippets = []
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.types as types_utils\n",
        "category": "import",
    }
]
s0 = get_class(types_utils.ArticulationAction, "articulation_action")
s1 = get_methods(types_utils.ArticulationAction, "articulation_action")
subsnippets.append({"title": "ArticulationAction", "snippets": [s0] + s1})

s0 = get_class(types_utils.ArticulationActions, "articulation_actions")
subsnippets.append(s0)

s0 = get_class(types_utils.DataFrame, "data_frame")
s1 = get_methods(types_utils.DataFrame, "data_frame")
subsnippets.append({"title": "DataFrame", "snippets": [s0] + s1})

s0 = get_class(types_utils.DOFInfo, "dof_Info")
subsnippets.append(s0)

s0 = get_class(types_utils.DynamicState, "dynamic_state")
subsnippets.append(s0)

s0 = get_class(types_utils.DynamicsViewState, "dynamics_view_state")
subsnippets.append(s0)

s0 = get_class(types_utils.JointsState, "joints_state")
subsnippets.append(s0)

s0 = get_class(types_utils.XFormPrimState, "xform_prim_state")
subsnippets.append(s0)

s0 = get_class(types_utils.XFormPrimViewState, "xform_prim_view_state")
subsnippets.append(s0)

s0 = get_functions(types_utils, "types_utils")
snippets_core_utils.append({"title": "Types", "snippets": im + subsnippets})

# viewports_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.viewports as viewports_utils\n",
        "category": "import",
    }
]
s0 = get_functions(viewports_utils, "viewports_utils")
snippets_core_utils.append({"title": "Viewports", "snippets": im + s0})

# xforms_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.xforms as xforms_utils\n",
        "category": "import",
    }
]
s0 = get_functions(xforms_utils, "xforms_utils")
snippets_core_utils.append({"title": "XForms", "snippets": im + s0})

# warp_utils
im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.core.utils.warp as warp_utils\n",
        "category": "import",
    }
]
s0 = get_functions(warp_utils, "warp_utils")
s1 = []
s2 = get_functions(warp_utils_rotations, "warp_utils")
s3 = get_functions(warp_utils_tensor, "warp_utils")
s4 = get_functions(warp_utils_transformations, "warp_utils")
snippets_core_utils.append({"title": "Warp", "snippets": im + sorted(s0 + s1 + s2 + s3 + s4, key=lambda x: x["title"])})

file_name = "python-isaac-sim-core-utils.json"
file_path = os.path.join(SAVE_PATH, file_name) if SAVE_PATH else file_name
with open(file_path, "w") as f:
    json.dump(snippets_core_utils, f, indent=0, separators=(",", ":"))

# ========================================
# UI UTILS
# ========================================
from omni.isaac.ui import ui_utils

snippets_ui_utils = []

im = [
    {
        "title": "import ...",
        "description": "Import module",
        "snippet": "import omni.isaac.ui as ui_utils\n",
        "category": "import",
    }
]
s0 = get_functions(ui_utils, "ui_utils")
snippets_ui_utils = im + s0

file_name = "python-isaac-sim-ui-utils.json"
file_path = os.path.join(SAVE_PATH, file_name) if SAVE_PATH else file_name
with open(file_path, "w") as f:
    json.dump(snippets_ui_utils, f, indent=0, separators=(",", ":"))

# ========================================
# SIMULATION APP
# ========================================
from omni.isaac.kit import SimulationApp

snippets_simulation_app = []

snippets_simulation_app.append(
    generate_class(
        SimulationApp,
        [],
        import_statement="from omni.isaac.kit import SimulationApp",
    )
)

file_name = "python-isaac-sim-simulation-app.json"
file_path = os.path.join(SAVE_PATH, file_name) if SAVE_PATH else file_name
with open(file_path, "w") as f:
    json.dump(snippets_simulation_app, f, indent=0, separators=(",", ":"))

print("Snippets generated!")
