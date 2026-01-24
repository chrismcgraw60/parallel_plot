import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Button } from "@/components/ui/button";

const Robot = ({ robot, color, isSelected, onClick }) => {
  const {
    headSize,
    bodyHeight,
    bodyWidth,
    armLength,
    legLength,
    antennaHeight,
    bodyShape,
    headShape
  } = robot;

  const totalHeight = antennaHeight + headSize + bodyHeight + legLength;
  const totalWidth = Math.max(headSize, bodyWidth, armLength * 2);
  const centerX = totalWidth / 2;
  const startY = antennaHeight;

  const RobotHead = () => headShape === 'circular' ? (
    <circle
      cx={centerX}
      cy={startY + headSize/2}
      r={headSize/2}
      fill="none"
      stroke={color}
      strokeWidth={isSelected ? "3" : "2"}
    />
  ) : (
    <rect
      x={centerX - headSize/2}
      y={startY}
      width={headSize}
      height={headSize}
      fill="none"
      stroke={color}
      strokeWidth={isSelected ? "3" : "2"}
    />
  );

  const RobotBody = () => bodyShape === 'circular' ? (
    <circle
      cx={centerX}
      cy={startY + headSize + bodyHeight/2}
      r={bodyWidth/2}
      fill="none"
      stroke={color}
      strokeWidth={isSelected ? "3" : "2"}
    />
  ) : (
    <rect
      x={centerX - bodyWidth/2}
      y={startY + headSize}
      width={bodyWidth}
      height={bodyHeight}
      fill="none"
      stroke={color}
      strokeWidth={isSelected ? "3" : "2"}
    />
  );

  return (
    <svg 
      viewBox={`0 0 ${totalWidth} ${totalHeight}`} 
      className={`w-24 h-24 cursor-pointer ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 rounded' : ''}`}
      onClick={onClick}
    >
      <line 
        x1={centerX} 
        y1={startY} 
        x2={centerX} 
        y2={0}
        stroke={color}
        strokeWidth={isSelected ? "3" : "2"}
      />
      
      <RobotHead />
      
      <circle
        cx={centerX - headSize/4}
        cy={startY + headSize/2}
        r={headSize/8}
        fill={color}
      />
      <circle
        cx={centerX + headSize/4}
        cy={startY + headSize/2}
        r={headSize/8}
        fill={color}
      />
      
      <RobotBody />
      
      <line
        x1={centerX - bodyWidth/2}
        y1={startY + headSize + bodyHeight/3}
        x2={centerX - armLength}
        y2={startY + headSize + bodyHeight/3}
        stroke={color}
        strokeWidth={isSelected ? "3" : "2"}
      />
      <line
        x1={centerX + bodyWidth/2}
        y1={startY + headSize + bodyHeight/3}
        x2={centerX + armLength}
        y2={startY + headSize + bodyHeight/3}
        stroke={color}
        strokeWidth={isSelected ? "3" : "2"}
      />
      
      <line
        x1={centerX - bodyWidth/4}
        y1={startY + headSize + bodyHeight}
        x2={centerX - bodyWidth/4}
        y2={startY + headSize + bodyHeight + legLength}
        stroke={color}
        strokeWidth={isSelected ? "3" : "2"}
      />
      <line
        x1={centerX + bodyWidth/4}
        y1={startY + headSize + bodyHeight}
        x2={centerX + bodyWidth/4}
        y2={startY + headSize + bodyHeight + legLength}
        stroke={color}
        strokeWidth={isSelected ? "3" : "2"}
      />
    </svg>
  );
};

const ParallelPlot = () => {
  const svgRef = useRef(null);
  const brushesRef = useRef([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [solutionCount, setSolutionCount] = useState(1);
  const [dimensions] = useState({
    width: 960,
    height: 500,
    margin: { top: 30, right: 80, bottom: 50, left: 50 }
  });

  const [data] = useState(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      name: `Robot ${i + 1}`,
      value2: Math.random() * 100,
      value3: Math.random() * 100,
      value4: Math.random() * 100,
      value5: Math.random() * 100,
      robot: {
        headSize: 20 + Math.random() * 10,
        bodyShape: Math.random() > 0.5 ? 'rectangular' : 'circular',
        ...(() => {
          const r_strength = Math.random() * 100;
          const baseArea = 500 + (r_strength * 10);
          const aspectRatio = 0.5 + Math.random();
          
          if (Math.random() > 0.5) {
            const bodyHeight = Math.sqrt(baseArea * aspectRatio);
            const bodyWidth = baseArea / bodyHeight;
            return { bodyHeight, bodyWidth, r_strength };
          } else {
            const radius = Math.sqrt(baseArea / Math.PI);
            return { 
              bodyHeight: radius * 2,
              bodyWidth: radius * 2,
              r_strength
            };
          }
        })(),
        armLength: 25 + Math.random() * 15,
        legLength: 25 + Math.random() * 15,
        antennaHeight: 10 + Math.random() * 10,
        headShape: Math.random() > 0.5 ? 'rectangular' : 'circular'
      }
    }));
  });
  
  // Generate random thresholds for each dimension
  const [thresholds] = useState(() => {
    const dimensions_data = ['value2', 'value3', 'value4', 'value5'];
    const thresholds = {};
    
    dimensions_data.forEach(dim => {
      // Random thresholds between 0-100, ensuring lower < upper
      const lower = 20 + Math.random() * 30; // Between 20-50
      const upper = 60 + Math.random() * 30; // Between 60-90
      thresholds[dim] = { lower, upper };
    });
    
    return thresholds;
  });

  // Helper function to get scales and dimensions
  const getScalesAndDimensions = () => {
    const dimensions_data = Object.keys(data[0]).filter(d => d !== 'name' && d !== 'robot');
    const width = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
    
    const y = {};
    dimensions_data.forEach(d => {
      y[d] = d3.scaleLinear()
        .domain([0, 100])
        .range([height - 5, 5])
        .nice();
    });
    
    return { dimensions_data, width, height, y };
  };

  const clearAllBrushes = () => {
    if (brushesRef.current.length > 0) {
      brushesRef.current.forEach(brushGroup => {
        d3.select(brushGroup).call(brushGroup.brush.move, null);
      });
      
      d3.select(svgRef.current)
        .selectAll(".dataline")
        .style("opacity", 0.5)
        .style("stroke-width", 1);
      
      setFilteredLines(data);
      setSelectedRobot(null);
    }
  };
  
  // Function to apply brushes to match the green ranges
  const applyGreenRangeBrushes = () => {
    if (brushesRef.current.length > 0) {
      const { dimensions_data, y } = getScalesAndDimensions();
      
      // Apply brushes for each dimension to match green ranges
      brushesRef.current.forEach((brushGroup, i) => {
        const dim = dimensions_data[i];
        const upperValue = thresholds[dim].upper;
        
        // Calculate pixel positions for brush (from top of green to top of axis)
        const upperPixel = y[dim](upperValue);
        const topPixel = y[dim](100);
        
        // Apply brush with the calculated range
        d3.select(brushGroup).call(
          brushGroup.brush.move, 
          [topPixel, upperPixel]
        );
      });
      
      // Update filtered lines based on the new brushes
      let actives = dimensions_data;
      let extents = {};
      
      dimensions_data.forEach(dim => {
        const upperValue = thresholds[dim].upper;
        extents[dim] = [100, upperValue]; // [max, min] format for the brush
      });
      
      // Apply filtering
      const currentFiltered = [];
      d3.select(svgRef.current)
        .selectAll(".dataline")
        .style("opacity", d => {
          const isVisible = actives.every(active => {
            const dim = active;
            const extent = extents[dim];
            return extent[1] <= d[dim] && d[dim] <= extent[0];
          });
          
          if (isVisible) {
            currentFiltered.push(d);
          }
          
          if (selectedRobot?.name === d.name) {
            return 1; // Keep selected robot fully visible
          }
          
          return isVisible ? 0.5 : 0.1;
        })
        .style("stroke-width", d => selectedRobot?.name === d.name ? 3 : 1);
      
      setFilteredLines(currentFiltered);
    }
  };
  
  // Function to optimize brushes by extending ranges until the desired number of solutions are found
  const optimizeBrushes = () => {
    if (brushesRef.current.length > 0) {
      const { dimensions_data, y } = getScalesAndDimensions();
      
      // Start with green ranges for each dimension
      let rangeExtensions = {};
      dimensions_data.forEach(dim => {
        // Start with just the green range
        const upperValue = thresholds[dim].upper;
        rangeExtensions[dim] = {
          min: upperValue,  // Lower bound of range (upper threshold of green zone)
          max: 100          // Upper bound of range (top of axis)
        };
      });
      
      // Initialize with no solutions
      let solutionsFound = [];
      let extensionStep = 5; // Amount to extend ranges by in each iteration
      let maxIterations = 20; // Prevent infinite loops
      let iterations = 0;
      
      // Get the desired number of solutions (minimum 1)
      const targetSolutions = Math.max(1, solutionCount);
      
      // Extend ranges until at least the desired number of solutions are found or max iterations reached
      while (solutionsFound.length < targetSolutions && iterations < maxIterations) {
        // Check if any robot passes through all current ranges
        solutionsFound = data.filter(robot => {
          return dimensions_data.every(dim => {
            const value = robot[dim];
            return value >= rangeExtensions[dim].min && value <= rangeExtensions[dim].max;
          });
        });
        
        // If not enough solutions, extend all ranges
        if (solutionsFound.length < targetSolutions) {
          dimensions_data.forEach(dim => {
            // Extend range by moving minimum lower
            rangeExtensions[dim].min = Math.max(0, rangeExtensions[dim].min - extensionStep);
          });
          iterations++;
        }
      }
      
      // Apply the optimized brushes
      brushesRef.current.forEach((brushGroup, i) => {
        const dim = dimensions_data[i];
        const minValue = rangeExtensions[dim].min;
        const maxValue = rangeExtensions[dim].max;
        
        // Calculate pixel positions for brush
        const minPixel = y[dim](minValue);
        const maxPixel = y[dim](maxValue);
        
        // Apply brush with the calculated range
        d3.select(brushGroup).call(
          brushGroup.brush.move, 
          [maxPixel, minPixel]
        );
      });
      
      // Update filtered lines based on the new brushes
      let actives = dimensions_data;
      let extents = {};
      
      dimensions_data.forEach(dim => {
        extents[dim] = [rangeExtensions[dim].max, rangeExtensions[dim].min]; // [max, min] format for the brush
      });
      
      // Apply filtering
      const currentFiltered = [];
      d3.select(svgRef.current)
        .selectAll(".dataline")
        .style("opacity", d => {
          const isVisible = actives.every(active => {
            const dim = active;
            const extent = extents[dim];
            return extent[1] <= d[dim] && d[dim] <= extent[0];
          });
          
          if (isVisible) {
            currentFiltered.push(d);
          }
          
          if (selectedRobot?.name === d.name) {
            return 1; // Keep selected robot fully visible
          }
          
          return isVisible ? 0.5 : 0.1;
        })
        .style("stroke-width", d => selectedRobot?.name === d.name ? 3 : 1);
      
      setFilteredLines(currentFiltered);
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();
    brushesRef.current = [];

    const width = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    const dimensions_data = Object.keys(data[0]).filter(d => d !== 'name' && d !== 'robot');

    const y = {};
    dimensions_data.forEach(d => {
      y[d] = d3.scaleLinear()
        .domain([0, 100])
        .range([height - 5, 5])
        .nice();
    });

    const x = d3.scalePoint()
      .range([0, width])
      .domain(dimensions_data);

    let actives = [];
    let extents = {};

    function brush() {
      actives = [];
      svg.selectAll(".brush")
        .each(function(d) {
          const brush = d3.brushSelection(this);
          if (brush) {
            actives.push(d);
            extents[d] = brush.map(y[d].invert);
          } else {
            delete extents[d];
          }
        });

      // Force actives to be an array even if selection is empty
      // to ensure we check all dimensions with active brushes
      actives = actives.length ? actives : [];

      const currentFiltered = [];
      svg.selectAll(".dataline")
        .style("opacity", d => {
          if (selectedRobot?.name === d.name) {
            const isVisible = actives.length === 0 || actives.every(active => {
              const dim = active;
              const extent = extents[dim];
              return extent[1] <= d[dim] && d[dim] <= extent[0];
            });
            
            if (isVisible) {
              currentFiltered.push(d);
            }
            return 1; // Always keep selected robot visible
          }

          if (actives.length === 0) {
            currentFiltered.push(d);
            return 0.5;
          }
          
          const isVisible = actives.every(active => {
            const dim = active;
            const extent = extents[dim];
            return extent[1] <= d[dim] && d[dim] <= extent[0];
          });

          if (isVisible) {
            currentFiltered.push(d);
          }
          return isVisible ? 0.5 : 0.1;
        })
        .style("stroke-width", d => selectedRobot?.name === d.name ? 3 : 1);

      setFilteredLines(currentFiltered);
    }

    const axes = svg.selectAll("g.axis")
      .data(dimensions_data)
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", d => `translate(${x(d)},0)`);
      
    // Make sure axis titles are properly positioned
    axes.append("text")
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .text(d => d);

    axes.append("g")
      .each(function(d) {
        d3.select(this).call(d3.axisLeft().scale(y[d]));
      });
      
    // Add colored axis bars to the right of the axis
    axes.append("g")
      .attr("class", "colored-axis")
      .attr("transform", "translate(0, 0)")
      .each(function(d) {
        const barWidth = 20;
        const g = d3.select(this);
        
        // Get dimension-specific thresholds
        const { lower, upper } = thresholds[d];
        
        // Calculate heights based on the y scale and thresholds
        const lowY = y[d](lower);
        const highY = y[d](upper);
        
        // Red section (bottom)
        g.append("rect")
          .attr("x", 0)
          .attr("y", lowY)
          .attr("width", barWidth)
          .attr("height", height - lowY)
          .attr("fill", "rgba(255, 0, 0, 0.3)")
          .attr("stroke", "rgba(255, 0, 0, 0.8)")
          .attr("stroke-width", 1);
          
        // Amber/Yellow section (middle)
        g.append("rect")
          .attr("x", 0)
          .attr("y", highY)
          .attr("width", barWidth)
          .attr("height", lowY - highY)
          .attr("fill", "rgba(255, 191, 0, 0.3)")
          .attr("stroke", "rgba(255, 191, 0, 0.8)")
          .attr("stroke-width", 1);
          
        // Green section (top)
        g.append("rect")
          .attr("x", 0)
          .attr("y", 5) // Account for the padding in the y scale
          .attr("width", barWidth)
          .attr("height", highY - 5)
          .attr("fill", "rgba(0, 128, 0, 0.3)")
          .attr("stroke", "rgba(0, 128, 0, 0.8)")
          .attr("stroke-width", 1);
      });

    axes.append("g")
      .attr("class", "brush")
      .each(function(d) {
        const brushGroup = this;
        const barWidth = 20; // Match color bar width
        const brushY = d3.brushY()
          .extent([[0, 0], [barWidth, height]]) // Make brush width match color bar width
          .on("brush", brush)
          .on("end", brush);
        
        d3.select(brushGroup).call(brushY);
        brushGroup.brush = brushY;
        brushesRef.current.push(brushGroup);
      });

    const line = d3.line()
      .defined(d => !isNaN(d[1]))
      .x(d => x(d[0]))
      .y(d => y[d[0]](d[1]));

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(d3.schemeCategory10);

    svg.selectAll("path.dataline")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "dataline")
      .attr("d", d => line(dimensions_data.map(p => [p, d[p]])))
      .style("fill", "none")
      .style("stroke", d => colorScale(d.name))
      .style("opacity", d => {
        if (selectedRobot?.name === d.name) return 1;
        if (actives.length === 0) return 0.5;
        
        const isVisible = actives.every(active => {
          const dim = active;
          const extent = extents[dim];
          return extent[1] <= d[dim] && d[dim] <= extent[0];
        });
        
        return isVisible ? 0.5 : 0.1;
      })
      .style("stroke-width", d => selectedRobot?.name === d.name ? 3 : 1);

    setFilteredLines(data);

    const style = document.createElement('style');
    style.textContent = `
      .brush .selection {
        stroke: #666;
        fill: #666;
        fill-opacity: 0.3;
        stroke-width: 1px;
      }
    `;
    document.head.appendChild(style);
  }, [data, dimensions, selectedRobot]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-4">
        <Button 
          onClick={clearAllBrushes}
          className="bg-blue-500 hover:bg-blue-700"
        >
          Clear All Filters
        </Button>
        <Button 
          onClick={applyGreenRangeBrushes}
          className="bg-green-600 hover:bg-green-800"
        >
          Filter by Green Range
        </Button>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="100"
            value={solutionCount}
            onChange={(e) => setSolutionCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
          />
          <Button 
            onClick={optimizeBrushes}
            className="bg-purple-600 hover:bg-purple-800"
          >
            Optimize for Solutions
          </Button>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
      <div className="w-full max-w-4xl p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          Filtered Robots ({filteredLines.length})
          {selectedRobot && ` - Selected: ${selectedRobot.name}`}
        </h3>
        <div className="flex flex-wrap gap-4">
          {filteredLines.map(line => (
            <div key={line.name} className="flex flex-col items-center">
              <Robot 
                robot={line.robot} 
                color={d3.schemeCategory10[filteredLines.indexOf(line) % 10]}
                isSelected={selectedRobot?.name === line.name}
                onClick={() => setSelectedRobot(selectedRobot?.name === line.name ? null : line)}
              />
              <span className="text-sm mt-1">{line.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParallelPlot;