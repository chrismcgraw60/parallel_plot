# Additional Features

- Selecting a DomainObject by clicking on a line on the chart must trigger a selection event that external components can use. I think we do this by handling the `requestSelectionChange` event but double check. We need to demonstrate this by selecting the Domain Object in the panel.

- For a selected plot, we can add extra emphasis by drawing a visible filled circle (configurable diameter with default 5px) on each y-axis at the place where the line intersects the exis.

- Double clicking a brush extent should remove the corresponding filter.

- The chart should resize resposively when its parent is resized. Currently, if I resize by making the browser window smaller, the chart does not resize.

# INSTRUCTIONS

- Implement these additional requiremts. Use beads for tracking your work.
- Once you have completed these requirements be sure to write them into the main requirements doc (docs/kickoff_requirements.md) in the relevant locations.
