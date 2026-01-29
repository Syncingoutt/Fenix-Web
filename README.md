<h1>Fenix - Flame Elementium Tracking Tool (Web)</h1>

<p>Fenix Web is a browser-based tool for Torchlight Infinite, allowing you to track Flame Elementium (FE) earnings. See real-time inventory value, run hourly sessions as a timer, track beacon and compass usage via log uploads, and more...</p>

<p>This project is not affiliated with or endorsed by XD (XD inc.) in any way.</p>

<p><b>This project does not use the Chinese FE tracker DB; meaning that some items might be missing (JSON file is over 300+). I have not added organs from Vorax, but all other items have been added.</b></p>

The web version of Fenix will always be updated a week after the Desktop version.

<i>Disclaimer: Portions of this repository were created or refined using AI-assisted development tools. Cursor was used extensively for script writing. UI/UX design was made by me without the use of AI.</i>

<details>
  <summary>
    <h2>Features</h2>
  </summary>

<h2>Tracking modes</h2>

<h3>Total</h3>
See the amount of FE you have earned. Totals are calculated automatically from the uploaded log.<br>
<img width="800" height="700" alt="Total tracking mode showing total FE earned and the 'reset' button" src="https://github.com/user-attachments/assets/820b3ed2-256d-4696-8b20-12424d6ffcb3" />
<br>

<h3>Hourly</h3>
<p>A simple timer mode: runs for one hour and plays a notification when complete.</p>
<img width="800" height="700" alt="Hourly tracking mode with an empty inventory, timer, and Start Hour button" src="https://github.com/user-attachments/assets/2eefc29b-0333-43ba-9d39-d714ea3cc441" />

<h4>Hourly sessions</h4>
<p>If you run multiple hourly sessions, you will be able to see each hour individually.</p>
<img width="500" height="400" alt="Hourly sessions popup showing multiple tracked hours listed separately" src="https://github.com/user-attachments/assets/56b72405-b06e-4e4e-8a11-590d6813f143" />

<h4>Track used compasses/beacons</h4>
<p>Track how many beacons, compasses, or resonances you have used to ensure totals reflect spending.</p>
<img width="306" height="375" alt="Hourly mode interface for selecting compasses, beacons to track as used" src="https://github.com/user-attachments/assets/3bdea5bc-5932-4ec1-af48-85d2aabfbb67" />
<br>
<img width="710" height="266" alt="Hourly calculation showing used compasses and beacons subtracting from total value" src="https://github.com/user-attachments/assets/e55c9369-6d51-4fa0-bb8e-21ccb8cba89f" />
<p>Keep in mind that this is not a way to check how many beacons/compasses/resonances you use, but instead to see how much to subtract from the total value. If you select Voidlands and use 5 compasses, it will show -5, then drop 2 will make it -3.</p>

<h2>Inventory</h2>
<p>See all items that appear in your uploaded log based on the selected mode.</p>
<img width="800" height="700" alt="Inventory view showing collected items based on the selected tracking mode" src="https://github.com/user-attachments/assets/e8743635-0b79-4b31-91c1-62393512d1be" />
<br>

<h3>Automatic price updating</h3>
<p>Prices are fetched from the desktop app version and reflected automatically in the web app.</p>
<br>

<h3>Breakdown</h3>
<p>See a breakdown of all collected items and the total value per group.</p>
<img width="256" height="440" alt="Inventory breakdown showing item groups and the total value for each group" src="https://github.com/user-attachments/assets/1ab4977b-b4e8-4c86-ab45-5ea8d5a679d3" /><br>
<i>To filter by group, simply click a group to show only items from that category.</i>

<h3>Tax</h3>
<p>Go to Settings -> Preferences to enable/disable tax inclusion in calculations.</p>
<img width="512" height="484" alt="Preferences settings showing the option to enable or disable tax inclusion in price calculations" src="https://github.com/user-attachments/assets/dce47778-d62f-477f-95c3-fb4e8d90f355" /><br>

<h3>Filter by min/max price</h3>
<p>Set minimum or maximum price values to filter items included in totals.</p>
<img width="303" height="88" alt="Price filter controls for setting minimum and maximum item values" src="https://github.com/user-attachments/assets/ddb5b962-5375-4980-ab16-f136cf15d386" />

<h3>Prices</h3>
<p>A page where you can view all items and their current values, sorted by group or search.</p>
<img width="1437" height="1067" alt="a market showing all items, a 7-day mini-graph, groups of items" src="https://github.com/user-attachments/assets/358b1eb0-ceaf-4051-b28b-2631184f5f2a" />
<i>Stock market style view, inspired by poe.ninja</i>

</details>

<details>
  <summary><h2>How does it work?</h2></summary>
  <p>The web app works by analyzing the uploaded UE_game.log from Torchlight Infinite, located at:</p>
  <code>SteamLibrary\steamapps\common\Torchlight Infinite\UE_game\TorchLight\Saved\Logs</code>
  <br><br>
  <p>By enabling logging, we can extract inventory updates, sorting events, and item pickups. Fenix Web filters this data to display totals, breakdowns, taxes, and prices.</p>
  <p>No memory reading or injection is used — all data comes directly from the game log.</p>
  <p>The program was written in TypeScript for web deployment.</p>
</details>
