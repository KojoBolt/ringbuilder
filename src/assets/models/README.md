# Diamond models

Centre-stone GLBs live in `public/assets/models/diamond/` and are served from
`/assets/models/diamond/<id>.glb`.

`components/ring/DiamondModel.tsx` loads the selected model with drei's
`useGLTF`, normalises its bounding box, computes facet normals (the source files
contain position data only) and overrides the transparent source material.

The eight cuts are: oval, radiant, emerald, pear, round, marquise, cushion and
princess. Ring bands and setting heads remain procedural and separate.

The head uses local XY for the girdle and +Z toward the table, then rotates
by -90 degrees around X to face ring-space +Y. All shipped assets use Z=0
as their girdle reference, table Z=0.33, and culet Z=-0.78. The crown and
pavilion layers must be remeasured if replacement models use a different profile.

`data/gemMeasurements.ts` records the actual girdle contours and volumes.
Run `node scripts/measure-gems.mjs` from `ring/` after replacing these GLBs.
This extractor targets the current single-mesh, untransformed, uncompressed
assets; transformed or compressed replacement models must be normalized first.
`components/ring/gemAssembly.ts` uses those measurements for uniform,
volume-based carat scaling, seating clearance, and cut-specific claw contacts.
Run `npm run test:geometry` (Node 24+) to check orientation, clearance,
equal-carat volume and claw contacts across all cuts and supported carats.

All eight centre stones share the optical renderer accepted for Round.
Halo and band stones retain Three's built-in physical transmission material.
The viewer's studio environment is captured once from softboxes and dark flags.
The cream background is also rendered inside Three for physical transmission.
Instanced band stones include their individual scale in the thickness value,
because native transmission uses modelMatrix rather than instanceMatrix.
Avoid Drei's MeshRefractionMaterial with the
installed Three r187: that shader includes `cube_uv_reflection_fragment`, which
is no longer present in Three.ShaderChunk. This renderer-time failure is not
caught by the React loading/error fallback or the TypeScript build. Halo and
pave stones also use built-in physical transmission materials. The supplied
facet topology still limits optical realism.

`DiamondOpticsMaterial.tsx` uses the installed
three-mesh-bvh package to trace the actual GLB triangles. It accumulates Fresnel
reflection/refraction and total internal reflection for up to eight boundaries,
with three wavelength IORs and four subpixel samples. The opaque shader samples
the existing raw studio cubemap, not the framebuffer or the PNG references.
It does not trace surrounding metal or caustics. Shared lighting, mounting,
asset files and carat scale are unchanged. Shader settings are identical to
the accepted Round renderer, with a separate BVH for each prepared mesh.

`gemGeometry.ts` repairs inward-facing culet triangles on prepared non-indexed
clones: eight faces for Radiant/Emerald, 32 for each other cut. It does not
rewrite any GLB. This centre-based orientation repair is specific to the eight
supplied star-shaped meshes. Run `npm run test:optics` (Node 24+) to check
consistent winding, watertightness, source preservation and internal rays from
four viewpoints for every cut. The original Round-only command remains valid:
`node scripts/verify-round-optics.mjs` (optionally pass a cut ID).

The reference PNGs are in `public/assets/models/diamond/references/`; they are
visual targets only and are never loaded by the gemstone renderer. The Round
GLB is still a seven-level, 32-sided construction, not a conventional brilliant
facet layout. Its ring-like reflection patterns cannot exactly match the PNG's
star pattern without a better cut mesh.
