# The `src/common/` Directory

The `src/common/` directory houses internal and third-party re-usable
components. Essentially, this folder is for everything that isn't completely
specific to this application.

Each component resides in its own directory that may then be structured any way
the developer desires.

```
src/
  |- common/
  |  |- hexBoard/
```

- `hexBoard` - a directive to turn a canvas element into a hex board, all contexts come from the scope

Every component contained here should be drag-and-drop reusable in any other 
project; they should depend on no other components that aren't similarly 
drag-and-drop reusable.
