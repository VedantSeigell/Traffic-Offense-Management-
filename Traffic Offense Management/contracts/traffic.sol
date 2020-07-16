pragma solidity ^0.5.1;

//main driver contract
contract traffic{
//model police
	struct police{
		uint p_id;
		string name;
		uint area;
		uint position;
		address policeAddress;
	}
// making ACP address payable to receive fines from users
	//address payable public ACP;
	address public DCP;
//Allows only ACP to access certain functions
	

	modifier onlyACP{
		require(policeOfficer[msg.sender]==true);
		require(position[msg.sender]==4);
		_;
	}

	//Creating object of police struct with policecount as key value of mapping
	mapping(uint=>police) public policeDB;
//makes account that first deploys contract as ACP 
mapping(uint=>bool) public Area_exist;
	constructor() public{
		DCP=msg.sender;
		policeDB[0]=police(1,"Major",100,5,DCP);
		Area_exist[100]=true;
	}
	modifier onlyDCP{
	    require(msg.sender==DCP);
	    _;
	}
	
//--------------------------------------------------------------------------------------------
//Function 1-> Adding officers :
//--------------------------------------------------------------------------------------------


//storing if account is a police officer 
	mapping(address=>bool) public policeOfficer;
//storing all accounts of police officers
	mapping(uint=>address) public policeAddress; //p_id to its address
//To have a count of HCs in system
	uint public HCcount=0; 
//To have a count of PSIs in system
	uint public PSIcount=0;
//To have a count of ASIs in system
	uint public ASIcount=0;
//To have a count of ACPs in system
    uint public ACPcount=0;
//Total count of police officers  
	uint public policecount=0;
	event policeadded(
		uint indexed p_id
	);

//linking police id to police count to access individual police officers based on id 
	mapping(uint=>uint) public policelist;
//To see if police id has been used or not
	mapping(uint=>bool) public pol_exist;
//to see if area has acp or not
    mapping(uint=>bool) public Acp_exist;
//to map address of ACP to certain area code 
    mapping(uint=>address payable)public Acp_area;
    
    function AddArea(uint _area,uint _p_id,string memory _name, address payable _officer) public onlyDCP{
        Area_exist[_area]=true;
        AddACP(_p_id,_name,_area,_officer);
    }
    mapping(address=>uint) public position;
//Adding ACP 
	function AddACP(uint _p_id,string memory _name, uint _area, address payable _officer) public onlyDCP{
	    require(pol_exist[_p_id]==false);
	    require(Acp_exist[_area]==false);
	    ACPcount++;
	    position[_officer]=4;
	    policeOfficer[_officer]=true;
	    pol_exist[_p_id]=true;
	    policecount++;
	    policeDB[policecount]=police(_p_id,_name,_area,4,_officer);
	    Acp_exist[_area]=true;
	    Acp_area[_area]=_officer;
	    policelist[_p_id]=policecount;
	    emit policeadded(_p_id);
	}  
	
	function ReplaceACP(uint _p_id1, address payable _officer1,uint _area, uint _p_id2, string memory _name2, address payable _officer2)public onlyDCP{
	    require(pol_exist[_p_id1]==true);
	    require(Acp_exist[_area]==true);
	    uint pcount=policelist[_p_id1];
	    policeDB[pcount].p_id=_p_id2;
	    policeDB[pcount].name=_name2;
	    policeDB[pcount].policeAddress=_officer2;
	    pol_exist[_p_id1]=false;
	    policeOfficer[_officer2]=true;
	    policeOfficer[_officer1]=false;
	    pol_exist[_p_id2]=true;
	    policelist[_p_id2]=pcount;
	    policelist[_p_id1]=0;
	    position[_officer1]=0;
	    position[_officer2]=4;
	}
	
//linking an account to a particular designation of Police (1=HC,2=ASI,3=PSI,4=ACP)
	function AddPolice (uint _p_id,string memory _name, uint _area, uint _position, address payable _officer) public onlyACP{
		require(pol_exist[_p_id]==false); //To make sure a pre existing police id isnt used 
		require(_position>0&&_position<4);//To make sure position is valid
		pol_exist[_p_id]=true;
		policeOfficer[_officer]=true;
		position[_officer]=_position;
		if(_position==1)
			HCcount++;
		else if (_position==2)
			ASIcount++;
		else 
			PSIcount++;

		policecount++;
		policeDB[policecount]=police(_p_id,_name,_area,_position,_officer); //creating objects of police struct linked to policecount
		policelist[_p_id]=policecount; //linking police id to police count to access individual officers based on id
		emit policeadded(_p_id);		
	}

//NEED TO ADD CHECK FOR EXISTING ACCOUNT FOR POLICE OFFICER

//------------------------------------------------------------------------------------------------------
//function 2-> Entering complaints and fines :
//------------------------------------------------------------------------------------------------------


//model offense
	struct offense{
		uint offense_id;
		string vehicle_no;
		uint area;
		string offense_type; //4 types based on fine amount - A) fines between 1-500 B)between 500-1000 C)between 1000-5000 D)between 5000-10000 
		//offense type can be made into uint type as well for simplicity sake
		uint p_id;
		uint license;
		string desc; //description of offense
		bool paid;
	}
//model fine
	struct fine{
		uint offense_id;
		uint amount;
		uint p_id;
		uint license;
		bool paid;
	}
	//linking offense id to a fine object 
	mapping (uint=>fine) public fineDB;
	mapping (uint=>uint) public finelist;
	//linking license to fine to see if it exists or not, will be used to view unpaid fines
	mapping (uint=>bool) fineExist;
	uint public fines;
	//mapping (string=>uint)	finecost;
	function RecordFine (uint _offense_id, uint _amount, uint _p_id, uint _license) public onlyPolice{
		fines++;
		fineDB[fines]=fine({offense_id:_offense_id,amount:_amount,p_id:_p_id,license:_license,paid:false});
		fineExist[_license]=true;
		finelist[_offense_id]=fines;
	}
//model user 
	struct user{
		uint license;
		string name;
		string vehicle_no;
		uint offenseCount;
		uint license_status; // 1- active 2- suspended 3- revoked -- based on offensecount 
	}

	event useradded(
		uint indexed license
	);
//mapping fine to offense
	//mapping(string=>uint) private OffenseCost;
	// a user can have multiple accounts for one license, this is used to link account address to license 
	mapping (address=>uint) public accountlicense;
	//to check if account address has already been registered to an account
	mapping (address=>bool) public useraccount;
	//allows function like add offense to be accessed only by Police officers
	modifier onlyPolice{
		require(policeOfficer[msg.sender]==true);
		_;
	}
	//maintaining count of users for iterating in displaying database
	uint public usercount=0;
	//creating user objects based on user count for iteration
	mapping (uint=>user) public userDB;
	//mapping a license to a usercount to access individual user's data based on license number
	mapping (uint=>uint) userlist;
	//made true if user with entered license exists in system, false if not
	mapping (uint=>bool) userexist;
	//true if offense id exists for an offense, false if not. This allows offense id to not be repeated
	mapping (uint=>bool) offenseExist;
	
	function RegisterUser (uint _license, string memory _name, string memory _vehicle_no, uint _offenseCount, uint _license_status) public{
		require (userexist[_license]==false);
		usercount++;
		userDB[usercount]=user ({license:_license,name:_name,vehicle_no:_vehicle_no,offenseCount:_offenseCount,license_status:_license_status});
		userlist[_license]=usercount;
		userexist[_license]=true;
		accountlicense[msg.sender]=_license;
		useraccount[msg.sender]=true;
		emit useradded(_license);
	}
//count of offenses entered in the system
	uint public offenses=0; 
	//creating objects of struct offense based on number of offenses for iteration purposes
	mapping (uint=>offense) public offensedb;
	//linking offense id to offense count of system
	mapping(uint=>uint) offenseList;
	event offenseadded(
		uint indexed offense_id
	);
	
//adding offense
	function AddOffense (uint _offense_id,string memory _vehicle_no,uint _area,string memory _offense_type, uint _p_id, uint _license, string memory _desc) public onlyPolice{
		uint pc=policelist[_p_id];
 
		require (policeDB[pc].area==_area);  //checking police jurisdiction area wise
		require (offenseExist[_offense_id]==false); // checking if offense id exists
		//checking for valid offense type
		require (keccak256(bytes(_offense_type)) == keccak256(bytes("A"))||keccak256(bytes(_offense_type)) == keccak256(bytes("B"))||keccak256(bytes(_offense_type)) == keccak256(bytes("C")));
		if (userexist[_license]==false){ //check if user account exists in system based on license
			//since it doesnt we need to add user object with offense count of 1
			userexist[_license]=true;
			usercount++;
			userDB[usercount]=user({license:_license, name:"NA", vehicle_no:_vehicle_no, offenseCount:1, license_status:1});
			userlist[_license]=usercount;
			//userDB[usercount].offenseCount++;
		}
		else{// if user already exists
			uint uc=userlist[_license];
			userDB[uc].offenseCount++;
			if(userDB[uc].offenseCount==2||userDB[uc].offenseCount==3)
				RevokeLicense(_license);
		}
		offenses++;
		offensedb[offenses]=offense({offense_id:_offense_id,vehicle_no:_vehicle_no,area:_area,
									offense_type:_offense_type,p_id:_p_id,license:_license,desc:_desc,paid:false});
		offenseList[_offense_id]=offenses;
		uint _amount;
		//assigning ether amounts for fine payment, arbitrary numbers used for representation
		//A=>1 eth B=>2eth C=> 3 eth D=> 4 eth
		if(keccak256(bytes(_offense_type)) == keccak256(bytes("A")))
			_amount=1;  
		else if(keccak256(bytes(_offense_type)) == keccak256(bytes("B")))
			_amount=2;
		else 
			_amount=3;
		
		RecordFine(_offense_id,_amount,_p_id,_license); // recording fine after adding offense
		offenseExist[_offense_id]=true;
		emit offenseadded(_offense_id);
	}
	//allowing only PSI to access certain functions like revoking license
	
	function registeraccount (uint _license,address _newaccount) public {
	    require(userexist[_license]==true);
	    require(useraccount[_newaccount]!=true);
	    accountlicense[_newaccount]=_license;
	    useraccount[_newaccount]=true;
	}

	function payfine(uint _license, uint _offense_id,uint _area) public payable{
	    require(fineExist[_license]==true);
		require(userexist[_license]==true);
		if (useraccount[msg.sender]!=true){
			registeraccount(_license,msg.sender);
		}
		require(accountlicense[msg.sender]==_license);
		address payable Acp=Acp_area[_area];
		uint amount=fineDB[_offense_id].amount;
		amount=amount*1000000000000000000;
		deposit(amount);
		Acp.transfer(address(this).balance);
		fineDB[_offense_id].paid=true;
		offensedb[_offense_id].paid=true;
	}
	
	 function deposit(uint256 amount) payable public {
        require(msg.value == amount);
    }

    function RevokeLicense(uint _license) public {
		uint uc = userlist[_license];
		require(userDB[uc].offenseCount>1);
		if(userDB[uc].offenseCount==2)	
			userDB[uc].license_status=2;
		else 
			userDB[uc].license_status=3;		
	}
}