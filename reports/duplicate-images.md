# Duplicate Image Report

## Summary
- Scanned: 153 PNG files in `art/`
- Image dimensions: 720x576
- Exact duplicates by SHA-256: 0

## Method
1. Read every PNG in `art/`.
2. Record byte size, dimensions, and SHA-256.
3. Group by SHA-256 to identify confirmed duplicates.
4. Group by byte size plus dimensions to surface same-shape candidates.

## Exact Duplicates
No exact duplicate images were found.

## Same-Size Candidates
No same-size, same-dimension collision groups were found.

## Notes
- This is a report only; no artwork was removed or rewritten.
