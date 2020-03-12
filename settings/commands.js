const fetch = require("node-fetch");
const Discord = require('discord.js');
const url = "http://gamepatch.elswordonline.com/PatchPath.dat";
const sgame = "https://api.koggames.com/Server/CheckGameStat.ashx";
const getData = async url => {
  try {
    const response = await fetch(url);
    const content = await response.text();
    return content;
  } catch (error) {
    console.log(error);
    return error;
  }
};
const getWiki = async wikiurl => {
  try {
    const response = await fetch(wikiurl);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
    return error;
  }
};
const getServer = async sgame =>{
  try {
    const reply = await fetch(sgame);
    const rjson = await reply.json;
    return rjson;
  } catch (error) {
    console.log(error);
    return error;
    
  }


};



module.exports = function (bot, message) {
  if (message.author.bot) return;
  else if (message.content.startsWith("/kom")) {
      var prom1 = getData(url);
      prom1.then(function(msg){
      var nmsg = msg.slice(1,-1);
      var fmsg = nmsg + "/data/data001.kom";
      const exampleEmbed = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle('LINK TO DOWNLOAD INDIVIDUAL .KOM FILES')
        .setDescription(fmsg)
        .setFooter('Replace data001.kom with the file you need')
      message.channel.send(exampleEmbed);
      }
                 );
  }
  else if (message.content.startsWith("/wiki ")){
    const term = message.content.slice(6);
    console.log(term);
    var splitStr = term.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   // Directly return the joined string
    var nterm = splitStr.join(' '); 
    const bwikiurl = "https://elwiki.net/wiki/api.php?action=opensearch&format=json&search=" + nterm + "&limit=3";
    const wikiurl = encodeURI(bwikiurl);
    var prom2 = getWiki(wikiurl);
    var i=0;
    var sterm = "Elwiki Results for " + term;
    var sresult;
    var nresult = "No results found";

    prom2.then(function(res){
       const wikiEmbed = new Discord.RichEmbed()
      .setColor('#fffc2e')
      .setTitle(sterm)
      .setDescription("")
      .setFooter('DM errors/bugs to Ruru#9278.');
      if(res[3].length === 0) {
          wikiEmbed.description += nresult;
          }
      else{
          for(i=0;i<res[3].length; i++){
            var x = res[3][i];
            console.log(x);
            wikiEmbed.description += x + "\n";
             
          }
        
        
      }
      
     message.channel.send(wikiEmbed);
    }
               );

  

  
  
  }
}
