# Architecture

```
Browser (React) --/api--> Express API --> MongoDB
                              |
                              +--HTTP--> FastAPI ML service --> models/ (artifacts)
                                                 ^
                              pipelines/ --------+  (both import hiresense_core)
```

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Matching baseline | Skill coverage + TF-IDF cosine, configurable weights | Interpretable: any ranking can be explained term by term |
| Skill normalization | Versioned alias dictionary with unit tests | Testable; ambiguous tokens such as "R" and "Go" get documented rules |
| Shared logic | One `hiresense_core` package used by pipelines and the service | Identical preprocessing at training and serving time (no train/serve skew) |
| Model loading | Load artifacts once at startup, never train per request | Predictable latency; the model version is returned with every response |
| Failure handling | `/api/health` returns 200 with `status: degraded` when a dependency is down | The UI can show exactly what is missing |
| Error shape | `{ "error": { "code", "message", "details"? } }` everywhere | One format for the client to handle; internals never leak |
| Salary model | Decided only after the data audit | Built only if enough reliable, single-currency labels exist |

## Not decided yet

- Dataset (Milestone 2, after a licence check)
- Deployment target
