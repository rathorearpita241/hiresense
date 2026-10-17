"""Shared data-science core for HireSense.

Everything that must behave identically at training time and at inference time
(skill normalization, feature building, scoring) lives in this package, so the
offline pipelines and the FastAPI service import the same code. This avoids
train/serve skew.
"""

__version__ = "0.1.0"
