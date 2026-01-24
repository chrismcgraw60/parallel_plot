<template>
  <div class="w-full h-full flex flex-col items-center justify-center space-y-4">
    <div class="flex items-center space-x-4">
      <button 
        @click="clearAllBrushes"
        class="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
      >
        Clear All Filters
      </button>
      <button 
        @click="applyGreenRangeBrushes"
        class="px-4 py-2 bg-green-600 hover:bg-green-800 text-white rounded"
      >
        Filter by Green Range
      </button>
      <div class="flex items-center space-x-2">
        <input
          type="number"
          min="1"
          max="100"
          v-model.number="solutionCount"
          class="w-16 px-2 py-1 border border-gray-300 rounded text-center"
        />
        <button 
          @click="optimizeBrushes"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-800 text-white rounded"
        >
          Optimize for Solutions
        </button>
      </div>
    </div>
    <svg ref="svgRef" class="w-full h-full"></svg>
    <div class="w-full max-w-4xl p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        Filtered Robots ({{ filteredLines.length }})
        <span v-if="selectedRobot"> - Selected: {{ selectedRobot.name }}</span>
      </h3>
      <div class="flex flex-wrap gap-4">
        <div 
          v-for="line in filteredLines" 
          :key="line.name" 
          class="flex flex-col items-center"
        >
          <RobotComponent 
            :robot="line.robot" 
            :color="robotColor(line)"
            :isSelected="selectedRobot?.name === line.name"
            @click="toggleSelectRobot(line)"
          />
          <span class="text-sm mt-1">{{ line.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import * as d3 from 'd3';

const RobotComponent = {
  props: {
    robot: {
      type: Object,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const totalHeight = computed(() => {
      const { antennaHeight, headSize, bodyHeight, legLength } = props.robot;
      return antennaHeight + headSize + bodyHeight + legLength;
    });
    
    const totalWidth = computed(() => {
      const { headSize, bodyWidth, armLength } = props.robot;
      return Math.max(headSize, bodyWidth, armLength * 2);
    });
    
    const centerX = computed(() => totalWidth.value / 2);
    const startY = computed(() => props.robot.antennaHeight);
    
    return {
      totalHeight,
      totalWidth,
      centerX,
      startY
    };
  },
  template: `
    <svg 
      :viewBox="'0 0 ' + totalWidth + ' ' + totalHeight" 
      class="w-24 h-24 cursor-pointer"
      :class="isSelected ? 'ring-2 ring-offset-2 ring-blue-500 rounded' : ''"
    >
      <line 
        :x1="centerX" 
        :y1="startY" 
        :x2="centerX" 
        :y2="0"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      
      <!-- Head -->
      <circle
        v-if="robot.headShape === 'circular'"
        :cx="centerX"
        :cy="startY + robot.headSize/2"
        :r="robot.headSize/2"
        fill="none"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      <rect
        v-else
        :x="centerX - robot.headSize/2"
        :y="startY"
        :width="robot.headSize"
        :height="robot.headSize"
        fill="none"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      
      <!-- Eyes -->
      <circle
        :cx="centerX - robot.headSize/4"
        :cy="startY + robot.headSize/2"
        :r="robot.headSize/8"
        :fill="color"
      />
      <circle
        :cx="centerX + robot.headSize/4"
        :cy="startY + robot.headSize/2"
        :r="robot.headSize/8"
        :fill="color"
      />
      
      <!-- Body -->
      <circle
        v-if="robot.bodyShape === 'circular'"
        :cx="centerX"
        :cy="startY + robot.headSize + robot.bodyHeight/2"
        :r="robot.bodyWidth/2"
        fill="none"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      <rect
        v-else
        :x="centerX - robot.bodyWidth/2"
        :y="startY + robot.headSize"
        :width="robot.bodyWidth"
        :height="robot.bodyHeight"
        fill="none"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      
      <!-- Arms -->
      <line
        :x1="centerX - robot.bodyWidth/2"
        :y1="startY + robot.headSize + robot.bodyHeight/3"
        :x2="centerX - robot.armLength"
        :y2="startY + robot.headSize + robot.bodyHeight/3"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      <line
        :x1="centerX + robot.bodyWidth/2"
        :y1="startY + robot.headSize + robot.bodyHeight/3"
        :x2="centerX + robot.armLength"
        :y2="startY + robot.headSize + robot.bodyHeight/3"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      
      <!-- Legs -->
      <line
        :x1="centerX - robot.bodyWidth/4"
        :y1="startY + robot.headSize + robot.bodyHeight"
        :x2="centerX - robot.bodyWidth/4"
        :y2="startY + robot.headSize + robot.bodyHeight + robot.legLength"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
      <line
        :x1="centerX + robot.bodyWidth/4"
        :y1="startY + robot.headSize + robot.bodyHeight"
        :x2="centerX + robot.bodyWidth/4"
        :y2="startY + robot.headSize + robot.bodyHeight + robot.legLength"
        :stroke="color"
        :stroke-width="isSelected ? '3' : '2'"
      />
    </svg>
  `
};

export default {
  components: {
    RobotComponent
  },
  setup() {
    // Refs and reactive state
    const svgRef = ref(null);
    const brushesRef = ref([]);
    const filteredLines = ref([]);
    const selectedRobot = ref(null);
    const solutionCount = ref(1);
    
    const dimensions = reactive({
      width: 960,
      height: 500,
      margin: { top: 30, right: 80, bottom: 50, left: 50 }
    });
    
    // Generate random data
    const data = reactive(
      Array.from({ length: 100 }, (_, i) => ({
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
      }))
    );
    
    // Generate random thresholds for each dimension
    const thresholds = reactive({});
    ['value2', 'value3', 'value4', 'value5'].forEach(dim => {
      const lower = 20 + Math.random() * 30; // Between 20-50
      const upper = 60 + Math.random() * 30; // Between 60-90
      thresholds[dim] = { lower, upper };
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
    
    // Color function for robots
    const robotColor = (line) => {
      const index = filteredLines.value.indexOf(line);
      return d3.schemeCategory10[index % 10];
    };
    
    // Toggle robot selection
    const toggleSelectRobot = (line) => {
      if (selectedRobot.value?.name === line.name) {
        selectedRobot.value = null;
      } else {
        selectedRobot.value = line;
      }
    };
    
    // Clear all brushes
    const clearAllBrushes = () => {
      if (brushesRef.value.length > 0) {
        brushesRef.value.forEach(brushGroup => {
          d3.select(brushGroup).call(brushGroup.brush.move, null);
        });
        
        d3.select(svgRef.value)
          .selectAll(".dataline")
          .style("opacity", 0.5)
          .style("stroke-width", 1);
        
        filteredLines.value = data;
        selectedRobot.value = null;
      }
    };
    
    // Apply brushes to match green ranges
    const applyGreenRangeBrushes = () => {
      if (brushesRef.value.length > 0) {
        const { dimensions_data, y } = getScalesAndDimensions();
        
        // Apply brushes for each dimension to match green ranges
        brushesRef.value.forEach((brushGroup, i) => {
          const dim = dimensions_data[i];
          const upperValue = thresholds[dim].upper;
          
          // Calculate pixel positions for brush
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
        d3.select(svgRef.value)
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
            
            if (selectedRobot.value?.name === d.name) {
              return 1; // Keep selected robot fully visible
            }
            
            return isVisible ? 0.5 : 0.1;
          })
          .style("stroke-width", d => selectedRobot.value?.name === d.name ? 3 : 1);
        
        filteredLines.value = currentFiltered;
      }
    };
    
    // Optimize brushes by extending ranges until the desired number of solutions are found
    const optimizeBrushes = () => {
      if (brushesRef.value.length > 0) {
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
        const targetSolutions = Math.max(1, solutionCount.value);
        
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
        brushesRef.value.forEach((brushGroup, i) => {
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
        d3.select(svgRef.value)
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
            
            if (selectedRobot.value?.name === d.name) {
              return 1; // Keep selected robot fully visible
            }
            
            return isVisible ? 0.5 : 0.1;
          })
          .style("stroke-width", d => selectedRobot.value?.name === d.name ? 3 : 1);
        
        filteredLines.value = currentFiltered;
      }
    };
    
    // Initialize the visualization
    onMounted(() => {
      if (!svgRef.value) return;
      
      d3.select(svgRef.value).selectAll("*").remove();
      brushesRef.value = [];
      
      const width = dimensions.width - dimensions.margin.left - dimensions.margin.right;
      const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
      
      const svg = d3.select(svgRef.value)
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
        actives = actives.length ? actives : [];
        
        const currentFiltered = [];
        svg.selectAll(".dataline")
          .style("opacity", d => {
            if (selectedRobot.value?.name === d.name) {
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
          .style("stroke-width", d => selectedRobot.value?.name === d.name ? 3 : 1);
        
        filteredLines.value = currentFiltered;
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
            .on("start brush end", brush); // Handle all brush events
          
          d3.select(brushGroup).call(brushY);
          brushGroup.brush = brushY;
          brushesRef.value.push(brushGroup);
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
          if (selectedRobot.value?.name === d.name) return 1;
          if (actives.length === 0) return 0.5;
          
          const isVisible = actives.every(active => {
            const dim = active;
            const extent = extents[dim];
            return extent[1] <= d[dim] && d[dim] <= extent[0];
          });
          
          return isVisible ? 0.5 : 0.1;
        })
        .style("stroke-width", d => selectedRobot.value?.name === d.name ? 3 : 1);
      
      filteredLines.value = data;
      
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
    });
    
    // Watch for changes in selectedRobot to update the visualization
    watch(selectedRobot, () => {
      if (!svgRef.value) return;
      
      d3.select(svgRef.value)
        .selectAll(".dataline")
        .style("stroke-width", d => selectedRobot.value?.name === d.name ? 3 : 1)
        .style("opacity", d => {
          if (selectedRobot.value?.name === d.name) return 1;
          
          // Check if this line meets the current filter criteria
          const isVisible = filteredLines.value.some(line => line.name === d.name);
          return isVisible ? 0.5 : 0.1;
        });
    });
    
    return {
      svgRef,
      filteredLines,
      selectedRobot,
      solutionCount,
      robotColor,
      toggleSelectRobot,
      clearAllBrushes,
      applyGreenRangeBrushes,
      optimizeBrushes
    };
  }
};
</script>