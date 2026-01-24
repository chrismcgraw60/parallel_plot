# Requirements

## Overview

We want to build a reusable parallel plot chart for data visualision.

- It will be based on Vue3 Composition API, D3 and Typescript.
- It will operate on arbitrary sizes of data as far as possible.
- It will provide clear, clean abstractions for use as a general visualisation tool.
- It will be responsive and efficient.

## Features

### Domain Vocabulary

- **Domain Object**: The primary entity being visualized (e.g., a Robot).
- **Attribute**: A numerical property of the `Domain Object` (e.g., speed, efficiency). Each `Attribute` corresponds to a Y-`Axis`.
- **Plot**: The visual representation of a single `Domain Object`, rendered as a polyline connecting points across all `Axis`es.
- **Axis**: A vertical line representing the range of values for a specific `Attribute`.
- **Range**: A defined interval on an `Axis`, often with semantic meaning (e.g., "Safe", "Critical").
- **Brush**: An active filter window on an `Axis` that selects a subset of values.
- **Solution**: A `Domain Object` that satisfies a specific set of criteria, often used in the context of optimization.

### Data

- The plot should be data driven using interfaces and types that users can adapt their domain types to.
- Data for plots = label and map of values for each y axis.
- Data for visual "Range" bars

### Behaviour

#### Core Visualization

- **Multi-Axis Display**: Render multiple parallel y-`Axis`es, each representing a numerical `Attribute` of the `Domain Object`s.
- **Polyline Representation**: Display each `Domain Object` as a single polyline connecting points across all y-`Axis`es.
- **Contextual Ranges**: Display colored bars (e.g., Red, Amber, Green) on `Axis`es to define domain-specific `Range`s/thresholds.

#### Interactive Filtering

- **Brush Filtering**:
  - Allow users to click and drag on any `Axis` to create a filter `Range`.
  - Visualize the `Brush` with a distinct overlay.
  - **Active State**: `Plot`s passing through the filter `Range` remain at full opacity.
  - **Inactive State**: `Plot`s outside the filter `Range` are rendered with reduced opacity (ghosted).
- **Composite Filtering**: Support multiple active `Brush`es across different `Axis`es simultaneously (AND logic).

#### External Control (2-Way Binding)

- **External Selection**:
  - When a specific `Domain Object` is selected in the surrounding application (e.g., user clicks a Robot card), the chart must filter to show only that object.
  - **Robustness**: The chart's internal filter logic must gracefully handle external updates without conflict (e.g., clearing conflicting brushes or overriding them temporarily).

#### Global Controls

- **Clear All Filters**: One-click action to remove all active `Brush` filters and restore all `Plot`s to full visibility.
- **Named Range Filter** (e.g., "Filter by Green Range"):
  - Automatically filter to show only `Plot`s that fall within a specific named `Range` (e.g., "Green") across all applicable `Axis`es.
- **Optimization Mode**:
  - **Top N Selection**: Input control to specify the number of "top" `Solution`s to display.
  - **Optimize Action**: Trigger to select and highlight the top N `Plot`s that maximize values across `Attribute`s.

#### Component Interface

- **Inputs (Props)**:
  - `Data`: A collection of `Domain Object`s to be visualized.
  - `Axes`: Configuration for each `Axis` (label, range, etc.).
  - `Ranges`: A set of named `Range` definitions (e.g., Green: 80-100) for specific `Axis`es.
  - `ExternalSelection`: The ID or reference to a specific `Domain Object` selected externally.
- **Events (Outputs)**:
  - `FilterChange`: Emitted when the active filter state changes.
  - `SelectionChange`: Emitted when specific `Plot`s are selected internally or via optimization.
  - `RequestSelectionChange`: Emitted when the chart initiates a selection that needs to be reflected externally (if applicable), ensuring 2-way sync.

### Supporting Material - Previous Prototype

#### Prototype Screenshot

- See docs/claude_react_robots_artifact/p_plot.png

Here is how the screenshot corresponds to Features:

- We see that there are 4 y-`Axis` in this char which means the `Domain Object`s have 4 `Attribute`s. Each `Axis` has the name of the `Attribute` (eg value2, value3 etc)
- Each coloured line passing through each y-`Axis` represents a single `Domain Object` with a set of `Attribute`s
- Each `Axis` has a coloured bar which represents a set of `Range`s that are specific to the corresponding `Attribute`. These `Range`s are arbitrary and can be given specific styling. In this case we have 3 distinct `Range`s of RED, AMBER and GREEN which are different for each `Attribute`.
- The filter is enabled by dragging the `Brush` on a y-`Axis`. See the y-`Axis` corresponding to value3. We have dragged a `Brush` between 90 and 65. The `Brush` has a distinct overlay and the `Plot`s are filter to only those passing through the 90-65 `Range`.
  - Note how the `Plot`s that pass the filter have full opacity. Those `Plot`s that do not pass the filter are still shown but with reduced opacity.
- Along the top of the char we have 3 buttons:
  - `Clear All Filters` wil reset the filter such that all `Plot`s show.
  - `Filter by Green Range` will run a filter that only passes the `Plot`s which pass through the Named`Range` "Green" on each `Axis`
  - Next we have a text box holding a number and a button `Optimize for Solutions`. This will select the `Plot`s that maximise each `Attribute`. The textbox dicates how many `Solution`s will be rendered. So if the number is 1 we will render the top `Solution`. If the number is 10 we will render the top 10 `Solution`s.

### Example harness

- We should test our chart with an example data domain.
- We will use robots as sample `Domain Object`s (as you can see in the screenshot)
- A Robot has a fixed set of numerical attributes.
- We submit a list of Robot `Domain Object`s to the chart.
- We submit a set of `Range`s to the chart. We can go with RED, AMBER, GREEN for the example where we can set arbitrary `Range`s for each per `Axis`.
- Each Robot is rendered on the chart via its `Attribute`s which are plotted on multiple y `Axis` (eg value2, value3 etc). In the domain language of the chart, each Robot is a `Plot`.
- We have a separate component to render robots which corresponds to the `Plot`s on the chart. When the chart filters `Plot`s via its `Brush`Filter, the Robot Renderer will also filter the corresponding Robot visualisations. The intent here is to develop a robust event protocol for syncing chart actions with the outer domain.
