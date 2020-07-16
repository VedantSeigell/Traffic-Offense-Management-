App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  dcpflag:0, //
  polflag:0,
  acpflag:0,
  offflag:0,
  amo:0,
  areaflag:0,
  //acp:'0x3e04138975f9ac98caa71566f64539c7744fca16',

  init: function() {
    return App.initWeb3(); 
  },
  //web3.js is a javascript library that allows our client-side application to talk to the blockchain.
  //We configure web3 inside the "initWeb3" function.
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider; //assigns web3 instance from metamask to app instance
      web3 = new Web3(web3.currentProvider);
      } else {
       //Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545'); //or gives it a default local
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("traffic.json", function(traffic) { 
      //json file works because in truffle bs-config.json file the default is to build contract
      // Instantiate a new truffle contract from the artifact
      App.contracts.traffic = TruffleContract(traffic);
      // Connect provider to interact with contract
      App.contracts.traffic.setProvider(App.web3Provider);

      App.listenForEvents1();
      App.listenForEvents2();
      App.listenForEvents3();

      return App.render();
    });
  },

  listenForEvents1: function() {
  App.contracts.traffic.deployed().then(function(instance) {
    instance.useradded({}, {
      fromBlock: '0',
      toBlock: 'latest'
    }).watch(function(error, event) {
      console.log("event triggered", event)
      // Reload when a new user is registered
      App.render();
    });
  });
},

  listenForEvents2: function() {
  App.contracts.traffic.deployed().then(function(instance) {
    instance.policeadded({}, {
      fromBlock: '0',
      toBlock: 'latest'
    }).watch(function(error, event) {
      console.log("event triggered", event)
      // Reload when a new officer is registered
      App.render();
    });
  });
},
  listenForEvents3: function() {
  App.contracts.traffic.deployed().then(function(instance) {
    instance.offenseadded({}, {
      fromBlock: '0',
      toBlock: 'latest'
    }).watch(function(error, event) {
      console.log("event triggered", event)
      // Reload when a new offense is recorded
      App.render();
    });
  });
},

  render: function() {
    /* The render function lays out all the content on the page with data from the smart contract. 
    For now, we list the candidates we created inside the smart contract. 
    We do this by looping through each candidate in the mapping, and rendering it to the table. 
    We also fetch the current account that is connected to the blockchain inside this function and display it on the page.
    */
  var trafficInstance;
  var loader = $("#loader");
  var home1 = $("#home1");
  var home2 =$("#home2");
  var home3 =$("#home3");
  var register= $("#register");
  var existing=$("#ExistingU");
  var dispoffense=$("#OffenseDisplay");
  var payfine=$("#payfine");
  var fine=$("#fine");
  $("home3").hide();  

  // Load account data
  web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
      App.account = account;
      $("#accountAddress").html("Your Account: " + account);
      }
    });

   App.contracts.traffic.deployed().then(function(instance) {
    trafficInstance = instance;
    return trafficInstance.policecount();
  }).then(function(policecount){
    var acpRecord=$("#ACPRecord"); 
    acpRecord.empty();
    //var officerRecord=$("#OfficerRecord");
    //officerRecord.empty();  

    for(var i=0;i<=policecount;i++){
      trafficInstance.policeDB(i).then(function(police){
        var p_id=police[0];
        var name=police[1];
        var area=police[2];
        var pos=police[3];
        if(i==0)
          acpRecord.empty();
        if(pos==1)
          var position="HC";
        else if(pos==2)
          var position="ASI";
        else if(pos==3)
          var position="PSI";
        else if(pos==4)
          var position="ACP";
        else if(pos==5)
            var position="DCP";
        else
          var position="error";
        var paccount=police[4];
         var policeTemplate = "<tr><th>" + police[0] + "</th><td>" + police[1] + "</td><td>" +police[2]+ "</td><td>" + position + "</td><td>"+ police[4]+"</td></tr>"
        if(position=="ACP"||position=="DCP")
        {
          acpRecord.append(policeTemplate);
          var seen1 = {};
          $("table tr").each(function() {
              var txt = $(this).text();
            if (seen1[txt])
              $(this).remove();
            else
              seen1[txt] = true;
          });
        }
       
        });
      }
    }).catch(function(error) {
        console.warn(error);
    });
  },

viewAreaPol: function(){
  App.contracts.traffic.deployed().then(function(instance) {
    trafficInstance = instance;
    return trafficInstance.policecount();
  }).then(function(policecount){
  var acpRecord=$("#ACPRecord");
    acpRecord.empty();  

    for(var i=0;i<=policecount;i++){
      trafficInstance.policeDB(i).then(function(police){
        var are=$("#areac").val();
        var p_id=police[0];
        var name=police[1];
        var area=police[2];
        var pos=police[3];
        if(i==0)
          acpRecord.empty();
        if(pos==1)
          var position="HC";
        else if(pos==2)
          var position="ASI";
        else if(pos==3)
          var position="PSI";
        else if(pos==4)
          var position="ACP";
        else if(pos==5)
            var position="DCP";
        else
          var position="error";
        var paccount=police[4];
         var policeTemplate = "<tr><th>" + police[0] + "</th><td>" + police[1] + "</td><td>" +police[2]+ "</td><td>" + position + "</td><td>"+ police[4]+"</td></tr>"
        
        if(are==police[2]){
          acpRecord.append(policeTemplate);
          var seen = {};
          $("table tr").each(function() {
              var txt = $(this).text();
            if (seen[txt])
              $(this).remove();
            else
              seen[txt] = true;
          });
        }
      });
    }
  }).catch(function(error) {
        console.warn(error);
    });
},

viewAllPol: function(){
  App.contracts.traffic.deployed().then(function(instance) {
    trafficInstance = instance;
    return trafficInstance.policecount();
  }).then(function(policecount){
  var acpRecord=$("#ACPRecord");
    acpRecord.empty();  

    for(var i=0;i<=policecount;i++){
      trafficInstance.policeDB(i).then(function(police){
        
        var p_id=police[0];
        var name=police[1];
        var area=police[2];
        var pos=police[3];
        if(i==0)
          acpRecord.empty();
        if(pos==1)
          var position="HC";
        else if(pos==2)
          var position="ASI";
        else if(pos==3)
          var position="PSI";
        else if(pos==4)
          var position="ACP";
        else if(pos==5)
            var position="DCP";
        else
          var position="error";

        var paccount=police[4];
        var policeTemplate1 = "<tr><th>" + police[0] + "</th><td>" + police[1] + "</td><td>" +police[2]+ "</td><td>" + position + "</td><td>"+ police[4]+"</td></tr>"
        
          acpRecord.append(policeTemplate1);

          var seen1 = {};
          $("table tr").each(function() {
              var txt = $(this).text();
            if (seen1[txt])
              $(this).remove();
            else
              seen1[txt] = true;
          });
      });
    }  
    $("#AllPolice").show();
    $("#policedisplay").show(); 
  }).catch(function(error) {
        console.warn(error);
    });
},

ViewUsers: function(){
  App.contracts.traffic.deployed().then(function(instance){
    trafficInstance=instance;
    return trafficInstance.usercount()
  }).then(function(usercount){
    var alluser=$("#alluser");
    alluser.empty();

    for(var i=1;i<=usercount;i++){
      trafficInstance.userDB(i).then(function(user){
        var license=user[0];
        var name=user[1];
        var veh_num=user[2];
        var offensecount=user[3];
       
        if(user[4]==1)
          var license_status="Active" ;
        else if(user[4]==2)
          var license_status="Suspended";
        else 
          var license_status="Revoked";
        var userTemplate = "<tr><th>" + user[0] + "</th><td>" + user[1] + "</td><td>" +user[2]+ "</td><td>" + user[3] + "</td><td>" +license_status+ "</td></tr>"
        alluser.append(userTemplate);
      });
    }$("#policedisplay").hide();
    $("#AllUserDisplay").show();
    }).catch(function(error) {
      console.warn(error);
    });
  },


ViewUserOffense: function() {
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.offenses()
    }).then(function(offenses){
    var offenserecord=$("#Offense");
    offenserecord.empty();

    var enteredlicense=$("#licensenum").val();

    for(var i=1;i<=offenses;i++){
      trafficInstance.offensedb(i).then(function(offense){
        
        var o_id=offense[0];
        var veh_num=offense[1];
        var area=offense[2];
        var type=offense[3];
        var pol=offense[4];
        var desc=offense[6];
        var paid=offense[7];
        var offenseTemplate = "<tr><th>" + o_id + "</th><td>" + veh_num + "</td><td>" +area+ "</td><td>" + type + "</td><td>" +pol+ "</td><td>"+offense[5]+ "</td><td>"+desc+"</td><td>"+paid +"</td></tr>"
        if(enteredlicense==offense[5])
          {offenserecord.append(offenseTemplate);
            App.offflag=1;}
          App.OffenseCheck();
      });
    }
    }).catch(function(error) {
      console.warn(error);
    });
  },

OffenseCheck: function(){
  $("#policedisplay").hide();
    //var table=document.getElementById("OffenseDisplay").value;
    //document.write($("#offense tr").length);
    //if($("#OffenseDisplay tr").length<1)
    if(App.offflag==0){
      alert("No offenses found for entered license.");
      $("#home3").show();
    }
    else {
      $("#OffenseDisplay").show();
      $("#paybutton").show();
    }
    $("#ExistingU").hide();
},

showfine:function(){
  App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.fines()
    }).then(function(fines){
    var finedetail=$("#finedetail");
    finedetail.empty();
    var o_id=$("#offenseid").val();
    trafficInstance.finelist(o_id).then(function(finelist){
      var count=finelist;
      trafficInstance.fineDB(count).then(function(fine){
        var amo=fine[1];
        var id=fine[0];
         $("#Fine").show();
        $("#payfine").hide();
        if(fine[4]!=true)
        {
          var status="Not Paid";
          $("#buttonpay").show();
          
        }
        else {
          var status="Paid";
          alert("Fine for this offense has been paid!");
        }
        var fineTemplates ="<tr><th>"+o_id+"</th><td>"+amo+"</td><td>"+status+"</td></tr>"
        finedetail.append(fineTemplates);
      }); $("#OffenseDisplay").hide();
    });
    }).catch(function(error) {
      console.warn(error);
    });
},

payfine:function(){
  App.contracts.traffic.deployed().then(function(instance){
    trafficInstance=instance;
    return trafficInstance.fines()
    }).then(function(fines){
       var o_id=$("#offenseid").val();
       
      trafficInstance.finelist(o_id).then(function(finelist){
        var count=finelist;
        var licen=$("#licensenum").val();
        var area=$("#areac").val();
        trafficInstance.fineDB(count).then(function(fine){
            var amoun=fine[1];
            App.amo=amoun*10**18;
          return trafficInstance.payfine(licen,o_id,area, {from: App.account, gas:1000000, value:App.amo});
        }).then(function(result){
           alert("Fine Paid Successfully!");
          $("#main").show()
          $("#buttonpay").hide();
          $("#Fine").hide();
          App.render();
          $("#policedisplay").show();
        });
      });
    }).catch(function(error) {
      console.warn(error);
    }).catch(function(error) {
      console.warn(error);
    });
},

ViewAllOffense: function() {
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.offenses()
    }).then(function(offenses){
    var offenserecord=$("#Offense");
    offenserecord.empty();

    for(var i=1;i<=offenses;i++){
      trafficInstance.offensedb(i).then(function(offense){
        var o_id=offense[0];
        var veh_num=offense[1];
        var area=offense[2];
        var type=offense[3];
        var pol=offense[4];
        var license=offense[5];
        var desc=offense[6];
        var offenseTemplates = "<tr><th>" + o_id + "</th><td>" + offense[1] + "</td><td>" +offense[2]+ "</td><td>" + offense[3] + "</td><td>" +offense[4]+ "</td><td>"+offense[5]+"</td><td>"+offense[6]+ "</td><td>"+offense[7] +"</td></tr>"
        offenserecord.append(offenseTemplates);
      });
    } $("#policedisplay").hide();
    }).catch(function(error) {
      console.warn(error);
    });
  },

ViewAreaOffense: function() {
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.offenses()
    }).then(function(offenses){
    var offenserecord=$("#Offense");
    offenserecord.empty();
    var are=$("#areac").val();
    for(var i=1;i<=offenses;i++){
      trafficInstance.offensedb(i).then(function(offense){
        var o_id=offense[0];
        var veh_num=offense[1];
        var area=offense[2];
        var type=offense[3];
        var pol=offense[4];
        var license=offense[5];
        var desc=offense[6];
        var offenseTemplates = "<tr><th>" + o_id + "</th><td>" + offense[1] + "</td><td>" +offense[2]+ "</td><td>" + offense[3] + "</td><td>" +offense[4]+ "</td><td>"+offense[5]+"</td><td>"+offense[6]+ "</td><td>"+offense[7] +"</td></tr>"
        if(are==offense[2])
          offenserecord.append(offenseTemplates);
      });
    }$("#policedisplay").hide();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  ViewUnpaid: function(){
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.fines()
    }).then(function(fines){
      var unpaiduser=$("unpaiduser");
      unpaiduser.empty();

      for(var i=1;i<=fines;i++){
        trafficInstance.finesDB(i).then(function(fine){
            var payment=fine[4];
            //if (payment==="false")
            //{
              var offen=fine[0];
              var amount=fine[1];
              var pol=fine[2];
              var lic=fine[3];
              var fineTemplates ="<tr><th>"+fine[0]+"</th><td>"+fine[1]+"</td><td>"+fine[2]+"</td><td>"+fine[3]+"</td></tr>"
              unpaiduser.append(fineTemplates);
            //}
          });
        };
      }).catch(function(error){
      console.error(error);
    });
  },

RegisterUser: function() {
   $("#register").hide();
    $("#loader").show();
    $("#policedisplay").hide();
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
       return trafficInstance.usercount();
    }).then(function(usercount){
        var license=$("#newlicense").val();
        var username= $("#newusername").val();
        var vehicle=$("#newvehicle").val();
        return trafficInstance.RegisterUser(license,username,vehicle,0,1);
       }).then(function(users){
        $("#register").hide();
        $("#home3").show();
        $("#loader").hide();

      }).catch(function(error) {
      console.warn(error);
    });
  },

AddArea: function() {
  $("#AddArea").hide();
  $("#loader").show();
  App.contracts.traffic.deployed().then(function(instance){
    trafficInstance=instance;
    return trafficInstance.policecount();
  }).then(function(policecount){
    var newarea=$("#newarea").val()
    var acpid=$("#acpid").val();
    var acpname=$("#acpname").val();
    var acpacc=$("#acpacc").val();
    return trafficInstance.AddArea(newarea,acpid,acpname,acpacc);
  }).then(function(result){
    $("#loader").hide();
    $("#DCP").show();
  }).catch(function(error) {
      console.warn(error);
  });
},

ReplaceAcp: function(){
  $("#Replace").hide();
  $("#loader").show();
  App.contracts.traffic.deployed().then(function(instance){
    trafficInstance=instance;
    return trafficInstance.ACPcount();
  }).then(function(ACPcount){
    var oldacp=$("#oldacp").val();
    var oldacpacc=$("#oldacpacc").val();
    var reparea=$("#reparea").val();
    var newacpid=$("#newacpid").val();
    var newacpname=$("#newacpname").val();
    var newacpacc=$("#newacpacc").val();
    return trafficInstance.ReplaceACP(oldacp,oldacpacc,reparea,newacpid,newacpname,newacpacc);
  }).then(function(result){
    $("#loader").hide();
    $("#DCP").show();
  }).catch(function(error) {
      console.warn(error);   
  });
},


AddOffense: function(){
  var o_id=$("#poffense").val();
  var veh=$("#pvehiclenum").val();
  var area=$("#parea").val();
  var off_type=$("#pofftype").val();
  var pol_id=$("#police_id").val();
  var licen=$("#plicense").val();
  var desc=$("#pdesc").val();
  App.contracts.traffic.deployed().then(function(instance){
    return instance.AddOffense(o_id,veh,area,off_type,pol_id,licen,desc, {from: App.account, gas:600000});
  }).then(function(result){
    $("#addoffens").hide();
    $("#home3").show();
    App.viewAreaPol();
  }).catch(function(error){
    console.error(error);
  });
},


AddOfficer: function(){

    //var accountcheck=account.localeCompare(acp);
    $("#policedisplay").hide();
    var p_id=$("#pofficer").val();
   // var pid=parseInt(p_id);
    var p_name=$("#pname").val();
    var p_area=$("#polarea").val();
    var p_desig=$("#pdesig").val();
    var p_acc=$("#pacc").val();
      if(p_desig=="HC")
          var p_pos=1;
      else if(p_desig=="ASI")
          var p_pos=2;
      else if(p_desig=="PSI")
          var p_pos=3;
      else 
          var p_pos=0;
      App.contracts.traffic.deployed().then(function(instance){
    return instance.AddPolice(p_id,p_name,p_area,p_pos,p_acc, {from: App.account, gas:300000});
  }).then(function(result){
      App.render();
      $("#addofficer").hide();
      $("#main").show();
      $("#policedisplay").show();
    }).catch(function(error) {
      console.error(error);
    });
  },

 /* RevLicense: function(_license){
    var lice=_license;
    
    App.contracts.traffic.deployed().then(function(instance){
      return instance.RevokeLicense(lice, {from: App.account, gas:300000});
    }).then(function(status){
      $("#home3").show();
    }).catch(function(error){
      console.error(error);
    });
  },*/

  DCPauthorise: function(){
    App.contracts.traffic.deployed().then(function(instance){
        //App.variable.dcpflag=0;

        trafficInstance=instance;
      return trafficInstance.policecount();
    }).then(function(policecount){
      for(var i=0;i<=policecount;i++){
        trafficInstance.policeDB(i).then(function(police){
          var acc=App.account;
          var pacc=police[4];
          var posi=police[3];
          if(acc.localeCompare(pacc)==0 && posi==5){
            App.dcpflag=1;

          }
           //document.write(App.dcpflag);
          $("#main").hide();
          
          if(App.dcpflag==1){
            $("#policedisplay").hide();
            $("#DCP").show(); 
          }
          else
          {
            $("#home3").show();
            //$("#AreaPolice").show();
            App.viewAreaPol();
            //$("#policedisplay").show();
                       // $("#policedisplay").clone().appendTo("#home3");
              
            
          }
        });
     }
    }).catch(function(error){
      console.error(error);
    });
  },
  policeauthorise: function(){
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.policecount();
    }).then(function(policecount){
      trafficInstance.position(App.account).then(function(position){
        if (position>=1)
          App.polflag=1;
        //document.write(App.polflag);
        if(App.polflag==1){
            $("#home3").hide();
            $("#policehome").show();
          }
          else
          {
            alert("Invalid credentials, please retry with valid account.");
            $("#home3").show();
            $("#policedisplay").show();
            App.viewAreaPol();
           // $("#policedisplay").clone().appendTo("#home3");
          } 
      }); 
    }).catch(function(error){
      console.error(error);
    });
  },

  acpauthorise:function(){
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.policecount();
    }).then(function(policecount){
     trafficInstance.position(App.account).then(function(position){
        if (position==4)
          App.acpflag=1;
        if(App.acpflag==1){
          $("#policehome").hide();
            $("#addofficer").show();
          }
          else
          {
            alert("Invalid credentials, please retry with valid account.");
            $("#policehome").show();
            
           // $("#policedisplay").clone().appendTo("#home3");
          } 
      }); 
    }).catch(function(error){
      console.error(error);
    });
  },

  areaExists:function(){
    App.contracts.traffic.deployed().then(function(instance){
      trafficInstance=instance;
      return trafficInstance.policecount();
    }).then(function(policecount){
      var areacode=$("#areac").val();
      //document.write(areacode);
      trafficInstance.Area_exist(areacode).then(function(Area_exist){
      if(Area_exist!=true){
        App.areaflag=1;
        }
        //document.write(App.areaflag);
        if(App.areaflag==1){
        alert("Invalid area code! Please enter valid area code");
        $("#main").show();
        }
        else
          App.DCPauthorise();
        App.areaflag=0;
      });
    }).catch(function(error){
      console.error(error);
    });
  }
},

$(function() {
  $(window).load(function() {
    App.init();
  });
});
 