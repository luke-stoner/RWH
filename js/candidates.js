const candidate_descriptions = [
  {
    first: "Joe",
    last: "Biden",
    party: "D",
    image: "img/candidate_portraits/biden2.png",
    description:
      "Joe Biden is an American politician who has served as the 46th President of the United States since January 20, 2021. Prior to his presidency, Biden had a long political career, including serving as Vice President under President Barack Obama from 2009 to 2017. He is a member of the Democratic Party and has also represented the state of Delaware in the U.S. Senate from 1973 to 2009. Biden's political career has spanned several decades, and he has focused on a wide range of domestic and foreign policy issues during his tenure in public office.",
  },
  {
    first: "Doug",
    last: "Burgum",
    party: "R",
    image: "img/candidate_portraits/burgum.png",
    description:
      "Doug Burgum is an American entrepreneur and politician who has been serving as the Governor of North Dakota since 2016. He is a member of the Republican Party. Before entering politics, Burgum co-founded Great Plains Software, a business software company that was later acquired by Microsoft. He has focused on issues related to economic development and technology during his tenure as governor.",
  },
  {
    first: "Chris",
    last: "Christie",
    party: "R",
    image: "img/candidate_portraits/christie.png",
    description:
      "Chris Christie is an American politician and attorney who served as the 55th Governor of New Jersey from 2010 to 2018. He is a member of the Republican Party. Prior to his gubernatorial tenure, Christie held positions such as U.S. Attorney for the District of New Jersey, where he gained a reputation for prosecuting political corruption cases. He also ran for the Republican nomination in the 2016 presidential election.",
  },
  {
    first: "Ron",
    last: "DeSantis",
    party: "R",
    image: "img/candidate_portraits/desantis.png",
    description:
      "Ron DeSantis is an American politician who has served as the Governor of Florida since 2019. Prior to his gubernatorial role, he represented Florida's 6th congressional district in the U.S. House of Representatives. DeSantis is a member of the Republican Party.",
  },
  {
    first: "Larry",
    last: "Elder",
    party: "R",
    image: "img/candidate_portraits/elder.png",
    description:
      "Larry Elder is an American conservative radio host, author, and political commentator. He gained prominence as a talk show host known for his conservative viewpoints and libertarian beliefs. Elder is also the author of several books on politics and society. In 2021, he ran as a Republican candidate for Governor of California in a recall election, advocating for limited government and free-market principles.",
  },
  {
    first: "Asa",
    last: "Hutchinson",
    party: "R",
    image: "img/candidate_portraits/hutchinson.png",
    description:
      "Asa Hutchinson is an American lawyer and politician who has served as the Governor of Arkansas since 2015. He is a member of the Republican Party. Hutchinson has had a long career in public service, including serving as a U.S. Attorney, a member of the U.S. House of Representatives, and as the Director of the Drug Enforcement Administration (DEA). He has been involved in various policy areas, including drug enforcement, education, and healthcare.",
  },
  {
    first: "Nikki",
    last: "Haley",
    party: "R",
    description:
      "Nikki Haley is an American politician and diplomat. She served as the United States Ambassador to the United Nations from 2017 to 2018 during the Trump administration. Prior to her diplomatic role, she was the Governor of South Carolina from 2011 to 2017. Nikki Haley is a member of the Republican Party and has been known for her work on foreign policy and international relations.",
  },
  {
    first: "Perry",
    last: "Johnson",
    party: "R",
    description:
      "Perry Lawrence Johnson is an American businessman, author, and political candidate from Michigan. Johnson has written several books on international quality control standards and certification.",
  },
  {
    first: "Robert",
    last: "Kennedy",
    party: "I",
    image: "img/candidate_portraits/kennedy-jr.png",
    description:
      "Robert Kennedy, also known as Robert F. Kennedy, was an American politician and lawyer. He served as the 64th United States Attorney General from 1961 to 1964 under his brother, President John F. Kennedy. Later, he became a U.S. Senator from New York from 1965 until his assassination in 1968 during his presidential campaign. Robert Kennedy was a prominent figure in the civil rights movement and advocated for social justice and equality during his career.",
  },
  {
    first: "Mike",
    last: "Pence",
    party: "R",
    image: "img/candidate_portraits/pence.png",
    description:
      "Mike Pence is an American politician who served as the 48th Vice President of the United States from 2017 to 2021 under President Donald Trump. Before becoming Vice President, Pence was the Governor of Indiana from 2013 to 2017 and represented Indiana's 6th congressional district in the U.S. House of Representatives from 2001 to 2013. He is a member of the Republican Party and has been involved in conservative politics throughout his career.",
  },
  {
    first: "Vivek",
    last: "Ramaswamy",
    party: "R",
    image: "img/candidate_portraits/ramaswamy.png",
    description:
      "Vivek Ramaswamy is an American entrepreneur and author. He is known for his work in the biotechnology and pharmaceutical industry, having founded multiple biotech companies. Ramaswamy has also authored a book called 'Woke, Inc.: Inside Corporate America's Social Justice Scam,' which critiques corporate involvement in social and political issues.",
  },
  {
    first: "Tim",
    last: "Scott",
    party: "R",
    image: "img/candidate_portraits/scott.png",
    description:
      "Tim Scott is an American politician who serves as the junior United States Senator from South Carolina. He has been in office since 2013 and was reelected in 2016 and 2022. Scott is a member of the Republican Party and has a background in entrepreneurship and real estate. He has been involved in various legislative initiatives, including criminal justice reform and economic opportunity programs.",
  },
  {
    first: "Will",
    last: "Hurd",
    party: "R",
    image: "img/candidate_portraits/hurd.png",
    description:
      "Will Hurd is an American politician who served as the U.S. Representative for Texas's 23rd congressional district from 2015 to 2021. He is a member of the Republican Party. Before entering politics, Hurd had a background in cybersecurity and served as an officer in the Central Intelligence Agency (CIA). He was known for his bipartisan approach and focus on national security and technology issues during his time in Congress.",
  },
  {
    first: "Marianne",
    last: "Williamson",
    party: "D",
    image: "img/candidate_portraits/williamson.png",
    description:
      "Marianne Williamson is an American author, spiritual teacher, and lecturer. She gained recognition for her self-help books and teachings on spirituality. In 2020, she ran as a Democratic candidate for the U.S. presidential election, emphasizing issues such as healthcare reform and addressing social and economic inequalities.",
  },
  {
    first: "Donald",
    last: "Trump",
    party: "R",
    image: "img/candidate_portraits/trump.png",
    description:
      "Donald Trump is an American businessman and politician. He served as the 45th President of the United States from 2017 to 2021. Before entering politics, he was a real estate developer and television personality, known for hosting the reality show 'The Apprentice.'",
  },
];

const party_color = { R: "#E81B23", D: "#0000FF", I: "gray" };

// Dimensions and layout parameters
const width = 900; // Increase the width for more spacing
const height = 600; // Increase the height to accommodate the spacing
const circleRadius = 70; // Increase the circle radius
const circlePadding = 40; // Increase the circle padding to space them out
const columns = 5;
const rowHeight = 2 * circleRadius + circlePadding;
const colWidth = 2 * circleRadius + circlePadding;

// Create SVG element inside the div#candidate-info
const svg = d3
  .select("#candidate-info")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "candidate-svg");

// Create and position circles
svg
  .selectAll("circle")
  .data(candidate_descriptions)
  .enter()
  .append("circle")
  .attr("class", "candidate-circle")
  .attr("cx", (d, i) => (i % columns) * colWidth + circleRadius)
  .attr("cy", (d, i) => Math.floor(i / columns) * rowHeight + circleRadius)
  .attr("r", circleRadius)
  .attr("fill", (d) => party_color[d.party])
  .on("click", (event, d) => handleCircleClick(event, d));

svg
  .selectAll("text")
  .data(candidate_descriptions)
  .enter()
  .append("text")
  .text((d) => `${d.last}`)
  .attr("x", (d, i) => (i % columns) * colWidth + circleRadius)
  .attr("y", (d, i) => Math.floor(i / columns) * rowHeight + circleRadius + 4)
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("class", "candidate-label")
  .attr("fill", "white");

d3.select("head")
  .append("style")
  .text(".candidate-circle:hover { cursor: pointer; }");

function handleCircleClick(event, candidate) {
  console.log(candidate);
  const photoDiv = document.getElementById("candidate-info-photo");
  const bioDiv = document.getElementById("candidate-info-bio");

  photoDiv.innerHTML = `<img src="${candidate.image}" alt="${candidate.first} ${candidate.last}" style="width: 100%;" class="img-fluid hover-animate delay-1">`;
  bioDiv.textContent = candidate.description;
}
