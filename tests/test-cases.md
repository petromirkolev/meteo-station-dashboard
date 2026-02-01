## Smoke suite

1. App loads and main UI is visible

2. WebSocket connects and handshake occurs

3. First frame updates at least one raw metric

## Replay determinism suite

4. Given a known replay file, the first N frames produce expected UI values

5. Replay loops correctly

6. Formatting rules are stable

## Derived metrics suite

7. Heat Index / Feels Like are computed and rendered

8. Dew point is computed and rendered

9. Comfort label mapping is correct

10. Trend indicators behave correctly

## State + control suite

11. Initial state message is reflected in UI

12. Record button toggles UI state immediately

13. Record button results in backend-confirmed state

14. Recording produces a file in recordings dir

15. Recording content shape is correct

## Resilience / defensive behavior suite

16. Missing fields don’t crash the UI

17. Non-numeric / NaN values are handled properly

18. Malformed JSON line in replay file is ignored

19. WebSocket disconnect doesn’t brick the page

## Accessibility + UX

20. Record button is a real button and keyboard-usable

21. Tabs are appearing in the correct order

22. UI update loop doesn’t explode with more frames
