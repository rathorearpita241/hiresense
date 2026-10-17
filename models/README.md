# models/

Trained artifacts (vectorizers, model files, metadata JSON) are written here by the scripts in `pipelines/` and loaded once at startup by `ml-service/`. The binaries are git-ignored.

Every artifact set must ship with a metadata file recording: model version, training date, random seed, dataset snapshot, feature list, split strategy and evaluation metrics. The API returns the model version with each prediction or match.

Nothing has been trained yet.
