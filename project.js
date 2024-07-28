
let stored_data = [];
let list_of_countries = [];

let list_of_years = Array(2022 - 2000 + 1).fill().map((_, idx) => 2000 + idx); 

let startover_requested = false;
let screenNo = 1;

const svg = d3.select('svg');

const height = parseFloat(svg.attr('height'));
const width = parseFloat(svg.attr('width'));
const select_msg = 'To investigate gender income inequality by country and year, select from below lists:';

// Render the chart for country
const render = (data,countryName,country_summary,country_type) =>  {

  console.log('Render....')
  console.log(data)
  let yy = startover_requested;


  const xValue = d => d.gender;
  const yValue = d => d.value;

  const xAxisLabel = "Income Ratio: " + (data[0].value/data[1].value).toFixed(2);

  const margin = {top: 120, right: 60, bottom: 77, left: 80 };
  const innerwidth = width - margin.left - margin.right;
  const innerheight = height - margin.top - margin.bottom;
   
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerheight,0])
    .nice();

  const xScale = d3.scaleBand()
    .domain(data.map(xValue))
    .range([0,innerwidth])
    .padding(.25);

  const g = svg.append('g')
      .attr('transform',`translate(${margin.left},${margin.top})`);

  const xAxis = d3.axisBottom(xScale);

  const yAxisTickFormat = number => 
    d3.format('.2s')(number)
     .replace('G', 'B');

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerwidth)
    .tickPadding(20)
    .tickFormat(yAxisTickFormat);

 const yAsixG =  g.append('g').call(yAxis);

 //yAsixG.selectAll('.domain').remove();

  yAsixG.append('text')
     .attr('class','axis-label')
     .attr('y',-50)
     .attr('x',-innerheight/2)
     .attr('fill','black')
     .attr('transform',`rotate(-90)`)
     .attr('text-anchor','middle')
     .text("Income");

  const xAsixG =  g.append('g').call(xAxis)
      .attr('transform',`translate(0,${innerheight})`);

  xAsixG.select('.domain').remove();

//  xAsixG.append('text')
//     .attr('class','axis-label') 
//     .attr('y',75) 
//     .attr('x',innerwidth/2) 
//     .style('font-size', "30px")
//     .text(xAxisLabel);

  // Tip function
  // const tip = d3.tip().attr('class', 'd3-tip').offset([+40, 0]).html(d =>  {
  //        return "<strong style='color: Black;font-size:20px'>" + "Income : $" + d3.format('.3s')(d.value)  + "</strong>";
  //     });   

  // Call data join to draw the bar chart and call tip function
  g.selectAll('rect').data(data)
    .enter().append('rect')
      .attr('x', d => xScale(xValue(d)) )
      .attr('y', d => yScale(yValue(d)) )
      .attr('height', d => innerheight - yScale(yValue(d)) )
      .attr('width',xScale.bandwidth())
    //  .call(tip)
    //  .on('mouseover',tip.show)
    //  .on('mouseout',tip.hide);

  g.selectAll('.bartext').data(data)
    .enter().append('text')
      .attr('class','bartext')
      .attr('text-anchor','middle')
      .attr('fill','white')
      .attr('x', d => xScale(xValue(d)) + xScale.bandwidth()/2 )
      //.attr('y', d => innerheight - yScale(yValue(d)))
      .attr('y', d => yScale(yValue(d)) + 30 )
      .text(d => d3.format('.4s')(d.value) );

  let barratios = g.selectAll('.barratio').data(data)
    .enter().append('text')
      .attr('class','barratio')
      .attr('text-anchor','middle')
      .attr('fill', d => { 
                     if (countryName === 'South Korea' || countryName === 'Mozambique') {
                         return 'red';
                     }
                      else {
                         return 'white';
                      }
                    }  )
      .attr('x', d => xScale(xValue(d)) + xScale.bandwidth()/2 )
      //.attr('y', d => innerheight - yScale(yValue(d)))
      .attr('y', d => yScale(yValue(d)) + 60 )
//      .text(d => xAxisLabel );
        .text(d => (d.gender == 'Female' ) ?  xAxisLabel : '' );
//      .text(d => d.gender);
 
  // Country Label  at top of bar chart
  g.append('text')
     .attr('class','title') 
     .attr('x',innerwidth/2) // Move it up by 10 pixels
     .attr('y',-30) // Move it up by 10 pixels
     .style('font-size', "34px")
     .text(countryName)
     .attr('color','yellow')
     .attr('text-anchor','middle');

  // Button to move to next screen.
  const button  = g.append('circle')
      .attr('r',40)
      .attr('fill','steelblue')
      .attr('cy',-80)
      .attr('cx',innerwidth-10)
      .style("stroke", 'red' )
      .on('click',() => { do_upon_click()} );

  // Button Label
  g.append('text')
//     .text("Next Screen
     .text( () =>  { if(startover_requested) { return 'Start Over'} else {return 'Next Screen'} })
     .attr("id","button")
     .attr('y',-75)
     .attr('x',innerwidth-10)
     .attr('fill','black')
     .style('font-weight', 500);

  g.append('text')
//     .text("Next Screen
     .text( () =>  'Screen ' + screenNo + '/7' )
     .attr("id","screenNo")
     .attr('y',-75)
     .attr('x',innerwidth-110)
     .attr('fill','black')
     .style('font-weight', 500);

  // Populate Country Specific Data for static countries
  d3.select('body').select('#Country_Data')
     .selectAll('text')
     .text(country_summary);

  d3.select('body').select('#countryType')
     .select('h3')
     .text(country_type);

  //console.log('get x and y of exception:');
  //console.log(g.select('.barratio').attr("x"));

  let barratioElements =  barratios.nodes();


  // Add annotation for exception countries
  if (countryName === 'South Korea' || countryName === 'Mozambique') {

   const annotations1 = [
   {
    note: {
        label: "Income ratio is an exception.",
        title: "",
        align: "middle",  // try right or left  
        wrap: 200,  // try something smaller to see text split in several lines
        padding: 10   // More = text lower
     },
     connector: { end: 'arrow', type:'line'},
//     color: ["#69b3a2"],  
     color: ["#c11d1d"],  
//     x: innerwidth/2 -20,
//     y: +80,
//     x: g.select('.barratio').attr("x"), 
//     y: g.select('.barratio').attr("y"), 
     x: d3.select(barratioElements[1]).attr("x"), 
     y: d3.select(barratioElements[1]).attr("y") -10, 
     //x: 10,
     //y: 10,
     dy: -60,
     dx: +110,

    }
  ]
  const makeAnnotations = d3.annotation()
      .annotations(annotations1); 
  g.append("g").call(makeAnnotations); 

 }


};

const add_selection_list = () =>  { 
  // Add selection list object to conty_data div. 
  let select = d3.select('body').select('#Country_Data')
       .append('select')
  	.attr('class','select')
        //.style("left", "310px")
        //.style("top", "500px")
        .attr("id","choices")
        .on('change',onchange);

  let options = select
    .selectAll('option')
       .data(list_of_countries).enter()
       .append('option')
       .property("selected", (d)=> { 
           return d === countries_to_display_static_list[countries_to_display_static_list.length-1].country ;
        })
       .text(function (d) { return d; });

  function onchange(){
        //console.log('selected country ..')
	let selectValue = d3.select('select').property('value')
        let country_data = stored_data.filter(d => d.Entity === selectValue);
        countries_to_display.unshift({
          country: country_data[0].Entity,
          info: select_msg
        });
        //prepare_data_and_render(stored_data,countries_to_display,year_to_display);
        //prepare_data_and_render(stored_data,countries_to_display[0].country,year_to_display,countries_to_display[0].info);
        prepare_data_and_render(stored_data,countries_to_display[0].country,year_to_display,countries_to_display[0].info,countries_to_display[0].country_category);
        countries_to_display.shift(); 
    };
};

const add_year_list = () =>  { 
  // Add selection list object to conty_data div. 
  let select = d3.select('body').select('#Country_Data')
       .append('select')
  	.attr('class','select')
        //.style("left", "310px")
        //.style("top", "500px")
        .attr("id","years")
        .on('change',onchange);

  let options = select
    .selectAll('option')
       .data(list_of_years).enter()
       .append('option')
       .property("selected", (d)=> { return d === 2022 ;})
       .text(function (d) { return d; });

  function onchange(){
        //console.log('selected year..')
	year_to_display = d3.select('#years').property('value')
	let country_to_display = d3.select('#choices').property('value')
        prepare_data_and_render(stored_data,country_to_display,year_to_display,select_msg,"");
        //prepare_data_and_render(stored_data,countries_to_display,year_to_display);
    };
};

// Static list of countries (country code and summary text to diaply)
const countries_to_display_static_list = [
   {'country': 'United States',
    'country_type': 'Country Category: Developed',
    'info': `United States in 2022 had an income ratio of 1.46.
             The income levels for both male and females are among the top 5%.`
   },
   {'country': 'Norway',
    'country_type': 'Country Category: Developed',
    'info': 'Norway in 2022 had an income ratio of 1.26 which is among the lowest. It is a developed economy and is considered to be one of the most gender equal countries in the world.'
   },
   {'country': 'South Korea',
    'country_type': 'Country Category: Developed',
    'info': 'South Korea in 2022 had an income ratio of 1.96 which is one of the highest for a developed economy and above 1.5'
   },
   {'country': 'India',
    'country_type': 'Country Category: Developing',
    'info': 'India, one of the developing nations, in 2022 had an income ratio of 3.62.'
   },
   {'country': 'Sudan',
    'country_type': 'Country Category: Developing',
    'info': 'Sudan in 2022 had an income ratio of 3.02.'
   },
   {'country': 'Mozambique',
    'country_type': 'Country Category: Developing',
    'info': 'Mozambique in 2022 had a low income ratio of 1.31 which is an exception for a developing nation and indicates other factors at play.'
   }
];

// Dynamic list of countries ..deep copy.
let countries_to_display =  structuredClone(countries_to_display_static_list);
let year_to_display =  2022; 
 
const do_upon_click = () =>  { 
   //console.log('called do_upon_clicked') 
   //svg.selectAll('g').remove();

   if(startover_requested){
     // This means "Start Over... has been clicked"
     // Start with list of countries again
     countries_to_display =  structuredClone(countries_to_display_static_list);

     // Change button label back to Next Screen
     svg.select("#button").text("Next Screen");

     // Remove selection lists from Country Data Div.
     d3.select('body').select('#Country_Data').selectAll('select').remove();

     startover_requested = false;

     screenNo = 1;
     //prepare_data_and_render(stored_data,countries_to_display,year_to_display);
     prepare_data_and_render(stored_data,countries_to_display[0].country,year_to_display,countries_to_display[0].info,countries_to_display[0].country_type);
     // Remove country at head of list
     countries_to_display.shift(); 
     year_to_display = 2022;
   } 
   else
   {
     screenNo += 1;
    // Turn off main message
    //d3.select('body').select('#message').selectAll('text').remove();
    //d3.select('body').select('#message').style('display', "none")
    //d3.select('body').select('#message').style("display:none;");
    if(countries_to_display.length){
      //prepare_data_and_render(stored_data,countries_to_display,year_to_display);
      //prepare_data_and_render(stored_data,countries_to_display[0].country,year_to_display,countries_to_display[0].info);
      prepare_data_and_render(stored_data,countries_to_display[0].country,year_to_display,countries_to_display[0].info,countries_to_display[0].country_type);
      // Remove country at head of list
      countries_to_display.shift(); 
     }
     else{
        // Done with static country screens. 
        // Add select list of countries to Country data div.
        // Update button to indicate "Start Over"
        svg.select("#button")
          .text("Start Over")

          .attr('fill','white');
        svg.select('#screenNo')
           .text( () =>  'Screen ' + screenNo + '/7' ) 

        d3.select('body').select('#Country_Data').
           selectAll('text')
           .text(select_msg);
        d3.select('body').select('#countryType').
           selectAll('h3')
           .text("");

        add_selection_list();
        add_year_list();
        startover_requested = true;

	year_to_display = d3.select('#years').property('value')
	let country_to_display = d3.select('#choices').property('value')
     }
   }
};
 
d3.csv('data_all.csv').then(data => {
     //console.log(data);
     data.forEach(d => {
       // + makes String to number
       d.Male = +d['Gross national income per capita (male)'];
       d.Female = +d['Gross national income per capita (female)'];
       d.Year = +d.Year;

     });
     //console.log(data);
     stored_data = data;
     //list_of_countries = stored_data.map(d => d.Entity);
     list_of_countries = stored_data.filter(d => d.Year == list_of_years[0]).map(d => d.Entity);

     //console.log(countries_to_display);
     prepare_data_and_render(stored_data,countries_to_display[0].country,year_to_display,countries_to_display[0].info,countries_to_display[0].country_type);
     // Remove country at head of list
     countries_to_display.shift(); 
}); 

const prepare_data_and_render = (data,country_to_display,year_to_display,display_info,country_type) => {

     //console.log('country,year,country_category',country_to_display,year_to_display,country_type);
     // Work on the first country in the list
     let country_data = data.filter(data => 
         data.Year == year_to_display && data.Entity === country_to_display);

     //console.log(country_data);
     // Get income data from csv for first country
     let income_data = [];
     income_data.push({
      gender: 'Male',
      value: country_data[0].Male
      });
     income_data.push({
      gender: 'Female',
      value: country_data[0].Female
      });

     // Clear current svg 
     svg.selectAll('g').remove();

     //console.log(income_data);

     if( income_data[0].value == 0 || income_data[1].value ==0 ) {
        //console.log('print no data..');
        d3.select('body').select('#Country_Data').
           selectAll('text')
           .text('Data not available....');
     }
     else {
          render(income_data,country_data[0].Entity,display_info,country_type);
     }

     // Clear current svg 
     //svg.selectAll('g').remove();
     // Render chart for country with income data,country name and summary 
     //render(income_data,country_data[0].Entity,display_info,country_type);
}; 

