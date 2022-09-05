import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './project.css';
import OpenedLogo from './open.svg';
//Icons made by <a href="https://www.flaticon.com/authors/good-ware" title="Good Ware">Good Ware</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
import ClosedLogo from './closed.svg';
//Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
import $ from 'jquery';
import Cookies from 'js-cookie';
import { Chart } from 'react-chartjs-2';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoiZWRkeWVkZGllIiwiYSI6ImNrOXh6YjVwNzAxODMzcm81aW14cHBnOTEifQ.AJhhD0qBZOg26zgDohWscg';

let restaurants=[]
/*
[{restName: "Happy tree friends", restPhone: "12345678", restPrice:null,restURL:"http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",restOpen:"8am to 10pm", restLocation:"25 Street, Happy Road, Shau Kei Wan, HK",restID:"0001", restRating:1.5,restLat:"22.4196° N",restLong:" 114.2068° E",restIsOpen:true,restImg:"assets/cuhk.png",restDistanceFromCU: "400",viewCount: 100,favCount:0,commentCount:0, restCat:"Coffee Cafe" },
{restName: "Sad tree friends", restPhone: "12345678", restPrice:"$",restURL:"http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",restOpen:"8am to 10pm", restLocation:"23 Street, Happy Road, Shau Kei Wan, HK",restID:"0002", restRating:2.5,restLat:"22.4196° N",restLong:" 114.2068° E",restIsOpen:false,restImg:"assets/cuhk.png",restDistanceFromCU: "200",viewCount: 100,favCount:0,commentCount:0,restCat:"Coffee Cafe"},
{restName: "Mad tree friend", restPhone: "12345678", restPrice:"$$",restURL:"http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",restOpen:"8am to 10pm", restLocation:"24 Street, Happy Road, Shau Kei Wan, HK",restID:"0003", restRating:2,restLat:"22.4196° N",restLong:" 114.2068° E",restIsOpen:true,restImg:"assets/cuhk.png",restDistanceFromCU: "100",viewCount: 100,favCount:0,commentCount:0, restCat:"Coffee Cafe Cake"}]*/;

class App extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loc:window.location.pathname.split("/")[1] || "nonUser",
            errMsg: "",
            userID: null
        };
        window.addEventListener("popstate", () => {
            this.setState({ loc: window.location.pathname.split("/")[1] || "nonUser" });
        });
    }
   
    loginAsUserHandler = ()=>{
        let id = $("#userLoginID").val(), pw = $("#userPW").val();
        if (!id){
            this.setState({errMsg : "Please Enter Your User ID"});
        }
        else if (!pw){
            this.setState({ errMsg: "Please Enter Your Password" });
        }
        else if (id.length < 4 || id.length > 20){
            this.setState({ errMsg: "User ID should be 4–20 characters" });
        }
        else if (pw.length < 4 || pw.length > 20){
            this.setState({ errMsg: "Password should be 4–20 characters" });
        }
        else{
            $.post("http://localhost:3001/login",{id:id,pw:pw})
            .done((res)=>{
                if (res.includes("success")){
                    var userID=res.slice(8);
                    if(!this.state.tempLoc)
                    window.history.pushState(null,null,"/user");
                    this.setState({loc:"user", userID:userID});
                }
                else{
                    this.setState({ errMsg: res });
                }
            })
        }
    }
    
    loginAsAdminHandler = ()=>{
        window.history.pushState(null , null, "/admin");
        this.setState({loc : "admin"})
    }
    
    logoutAsAdminHandler = ()=>{
        window.history.pushState(null, null, "/");
        this.setState({ loc: "nonUser" })
    }

    render(){
        if (this.state.loc=="admin"){
             return (
                 <Admin logoutHandler={this.logoutAsAdminHandler}></Admin>
            )
        }
        else if (this.state.loc=="user"){
            return(
                <User logoutHandler={this.logoutAsAdminHandler} userID={this.state.userID}/>
            )
        }
        else {
            return(
                <NonUser loginAsUserHandler={this.loginAsUserHandler} loginAsAdminHandler={this.loginAsAdminHandler} errMsg={this.state.errMsg}></NonUser>
            )
        }
    }
    
    componentDidMount(){
        if(this.state.userID==null&&this.state.loc!="nonUser"){
            window.alert("Please login before going to destinated page!");
            this.setState({tempLoc:true,loc:"nonUser"});
        }
    }
}

//---------------------------NonUser-------------------------------------------

class NonUser extends React.Component{
    render(){
        return (
            <div className="container">
                <div className="header">
                <Title/>
                </div>
                <LoginForm loginAsUserHandler={this.props.loginAsUserHandler}></LoginForm>
                <div className="text-danger">{this.props.errMsg || this.props.errMsg}</div><br></br>
                <LoginAsAdmin loginAsAdminHandler={this.props.loginAsAdminHandler}></LoginAsAdmin>
            </div>
        );
    }
}

class LoginForm extends React.Component{
    render(){
        return (
            <form>
                <div className="form-group">
                    <label htmlFor="userLoginID"><i class="fas fa-user fa-lg"></i>&nbsp;&nbsp;User Login ID</label>
                    <input type="text" className="form-control mx-auto" id="userLoginID" placeholder="Enter your login ID" />
                </div>
                <div className="form-group">
                    <label htmlFor="userPW"><i class="fas fa-key fa-lg">
                    </i>&nbsp;&nbsp;Password</label>
                    <input type="password" className="form-control mx-auto" id="userPW" placeholder="Enter your password" />
                </div>
                <button type="button" className="btn btn-primary" onClick={this.props.loginAsUserHandler}>Login</button>
            </form>
        );
    }
}

class LoginAsAdmin extends React.Component{
    render(){
        return(
            <button type="button" className="btn btn-warning" onClick={this.props.loginAsAdminHandler}>Login As Admin</button>
        );
    }
}

//------------------------------User-------------------------------------------
let userFav=[];


class User extends React.Component{
    constructor(props){
        super(props);
        this.state={
            restaurants:restaurants,
            filteredRest: restaurants,
            sorting:false,
            singleRestID:window.location.pathname.split("/")[3],
            userID:this.props.userID,
            loc:"",
            isToggleHome:false,
            
            //Cookies.get('userID')
        };
        
    }
    filterRest=searchText=>{
        switch(document.querySelector('.searchSelection').value-0){
            case 0:
                return this.state.restaurants
                    .filter(rest=>{
                    if(rest.restName.toLowerCase().includes(
                        searchText.toLowerCase())||
                       rest.restLocation.toLowerCase().includes(
                        searchText.toLowerCase())||
                       rest.restCat.toLowerCase().includes(
                        searchText.toLowerCase())||
                       rest.restPrice==searchText){
                        return true;
                     }
                     return false;
                    });
                break;
                /*window.alert("Please choose the Search Criteria First!");
                document.querySelector('.bar').value="";
                return this.state.restaurants;
                break;*/
            case 1:
                return this.state.restaurants
                    .filter(rest=>{
                    if(rest.restName.toLowerCase().includes(
                        searchText.toLowerCase())){
                        return true;
                     }
                     return false;
                    });
                break;
            case 2:
                return this.state.restaurants
                    .filter(rest=>{
                    if(rest.restLocation.toLowerCase().includes(
                        searchText.toLowerCase())){
                        return true;
                     }
                     return false;
                    });
                break;
            case 3:
                return this.state.restaurants
                    .filter(rest=>{
                    if(rest.restCat.toLowerCase().includes(
                        searchText.toLowerCase())){
                        return true;
                     }
                     return false;
                    });
                break;
            case 4:
                return this.state.restaurants
                    .filter(rest=>{
                    if(rest.restPrice==searchText){
                        return true;
                     }
                     return false;
                    });
                break;
            case 5:
                var userLat=this.state.userInfo.lat,userLong=this.state.userInfo.long;
                console.log(this.state.userInfo);
                console.log(userLat);
                console.log(userLong);
                return this.state.restaurants
                    .filter(rest=>{
                    if (this.calculateDistance(userLat,userLong,rest.restLat,rest.restLong)<Number(searchText))
                        return true;
                    else
                        return false;
                });
                break;
        }
    };

    calculateDistance(lat1,lon1,lat2,lon2){
        var R = 6371e3; // metres
        var φ1 = lat1 * Math.PI/180; // φ, λ in radians
        var φ2 = lat2 * Math.PI/180;
        var Δφ = (lat2-lat1) * Math.PI/180;
        var   Δλ = (lon2-lon1) * Math.PI/180;

        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var d = R * c; 
        return d/1000;
    }
    
    handleSearchChange=event=>{
        this.setState({
            filteredRest: this.filterRest(event.target.value),singleRest:false
        });
    };
    
    sortOnClick=()=>{
        if(this.state.sorting){
            this.setState({sorting:false,singleRest:false});
        }
        else
            this.setState({sorting:true,singleRest:false});
    }
    
    sortPrice=(event)=>{
        var restaurants=this.state.filteredRest;
        var priceA=0,priceB=0,priceC=0,priceD=0,tmp,x,priceE=0;
        for (var i=0;i<restaurants.length;i++){
            if (restaurants[i].restPrice=="$")
                priceA++;
            else if(restaurants[i].restPrice=="$$")
                priceB++;
            else if(restaurants[i].restPrice=="$$$")
                priceC++;
            else if(restaurants[i].restPrice=="$$$$")
                priceD++;
            else
                priceE++;
        }
        var y=priceA;
        for(var i=0;i<priceA;i++){
            if (restaurants[i].restPrice!="$"){
                while(restaurants[y].restPrice!="$")
                y++;
                tmp=restaurants[i];
                restaurants[i]=restaurants[y];
                restaurants[y]=tmp;
            }
        };
        y=priceA+priceB;
        for(var i=priceA;i<priceA+priceB;i++){
            if (restaurants[i].restPrice!="$$"){
                while(restaurants[y].restPrice!="$$")
                y++;
                tmp=restaurants[i];
                restaurants[i]=restaurants[y];
                restaurants[y]=tmp;
            }
        };
        y=priceA+priceB+priceC;
         for(var i=priceA+priceB;i<priceA+priceB+priceC;i++){
            if (restaurants[i].restPrice!="$$$"){
                while(restaurants[y].restPrice!="$$$")
                y++;
                tmp=restaurants[i];
                restaurants[i]=restaurants[y];
                restaurants[y]=tmp;
            }
        };
        y=priceA+priceB+priceC+priceD;
         for(var i=priceA+priceB+priceC;i<priceA+priceB+priceC+priceD;i++){
            if (restaurants[i].restPrice!="$$$$"){
                while(restaurants[y].restPrice!="$$$$")
                y++;
                tmp=restaurants[i];
                restaurants[i]=restaurants[y];
                restaurants[y]=tmp;
            }
        };
        if (event.target.className=="plth"){
        this.setState({
            filteredRest: restaurants
        });}
        else{
            var temp;
            console.log(priceE);
            tmp=restaurants.slice(restaurants.length-priceE);
            restaurants.splice(restaurants.length-priceE,priceE);
            console.log(tmp);
            temp=tmp.concat(restaurants);
            console.log(temp);
            restaurants=temp.reverse();
          this.setState({
            filteredRest: restaurants
            }); 
        }
    };

    sortDistance=(event)=>{
        var restaurants=this.state.filteredRest;
        var mindist,tmp;
       for (var i=0;i<restaurants.length-1;i++){
           mindist= i;
           for(var j=i+1;j<restaurants.length;j++){
            if (parseInt(restaurants[j].restDistanceFromCU,10)<parseInt(restaurants[mindist].restDistanceFromCU))
                mindist=j;
           }
           tmp=restaurants[i];
           restaurants[i]=restaurants[mindist];
           restaurants[mindist]=tmp;
       }
        if (event.target.className=="dntf"){
        this.setState({
            filteredRest: restaurants
        });}
        else{
          this.setState({
            filteredRest: restaurants.reverse()
            }); 
        }
    }
    
    sortRate=event=>{
        var restaurants=this.state.filteredRest;
        var minrate,tmp;
       for (var i=0;i<restaurants.length-1;i++){
           minrate= i;
           for(var j=i+1;j<restaurants.length;j++){
            if (restaurants[j].restRating<restaurants[minrate].restRating)
                minrate=j;
           }
           tmp=restaurants[i];
           restaurants[i]=restaurants[minrate];
           restaurants[minrate]=tmp;
       }
        if (event.target.className=="rlth"){
        this.setState({
            filteredRest: restaurants
        });}
        else{
          this.setState({
            filteredRest: restaurants.reverse()
            }); 
        }
    }
    
    sortOpen=event=>{
        var restaurants=this.state.filteredRest;
        var opened=0,closed=0,tmp,x;
        for (var i=0;i<restaurants.length;i++){
            if (restaurants[i].restIsOpen==true)
                opened++;
            else 
                closed++;
        }
        var y=opened;
        for(var i=0;i<opened;i++){
            if (restaurants[i].restIsOpen!=true){
                while(restaurants[y].restIsOpen!=true)
                y++;
                tmp=restaurants[i];
                restaurants[i]=restaurants[y];
                restaurants[y]=tmp;
            }
        };
        if (event.target.className=="otc"){
        this.setState({
            filteredRest: restaurants
        });}
        else{
          this.setState({
            filteredRest: restaurants.reverse()
            }); 
        }
    };
    
    saveHomeHandler=()=>{
        var x=document.getElementById('homeCoordinates').textContent;
        var y=x.indexOf('Latitude');
        var long= x.slice(10,y);
        var lat=x.slice(y+10);
        $.post("http://localhost:3001/user/homeLocation",{userNickname:this.state.userID, userLat:lat,userLong:long}).done((res)=>{
                if (res=="saved user location"){
                    window.alert("Saved! Home Location will be updated next time you login!");
                $.get("http://localhost:3001/user/userData/" + this.state.userID)
                    .done((rests)=>{
                        this.setState({
                            isToggleHome: !this.state.isToggleHome,
                            userInfo:rests
                            });
                        console.log(rests);
                    }                
                )
            }
            
    })   
    }


    singleOnClick=event=>{
        var restClicked;
        if (event.target.className=="fas fa-heart fa-2x"){
            restClicked=event.target.parentElement.id;
            if(userFav.includes(restClicked)){
                var i=0;
                while (userFav[i]!=restClicked)
                    i++;
                userFav.splice(i,1);
                $.post("http://localhost:3001/user/unfav",{userNickname:this.state.userID,restID:restClicked}).done((res)=>{
                if (res=="success"){
                    console.log("Unfavourited!")
                }
                })
                window.alert("You have REMOVED "+ event.target.parentElement.querySelector(".restName").innerText+" from your Favourite List!");
                this.setState({sorting:false})
            }
            else{
            userFav.push(restClicked);
            $.post("http://localhost:3001/user/fav",{userNickname:this.state.userID,restID:restClicked}).done((res)=>{
                if (res=="success"){
                    console.log("Favourited!")
                }
                })
            window.alert("You have favourited "+ event.target.parentElement.querySelector(".restName").innerText+" !"); this.setState({sorting:false})
            }
        }
        else{
        var restClicked;
        restClicked=event.target;
        while(restClicked.className!="restItem")
            restClicked=restClicked.parentElement;
            window.history.pushState(null, null, "/user/singleRest/" + restClicked.id);
        this.setState({singleRestID:restClicked.id,loc:"singleRest"});
        }
    }
   
    backOnClick=()=>{
        window.history.pushState(null, null, "/user");
        this.setState({loc:""});
    }
    
    toggleMapHandler = () => {
        if(this.state.loc=="map"){
        window.history.pushState(null, null, "/user");
        this.setState({loc:""});}
        else{
        window.history.pushState(null, null, "/user/map");
        this.setState({loc:"map"});
        }
    }
    
    toggleHomeHandler=()=>{
        this.setState({ isToggleHome: !this.state.isToggleHome })
    }
    
    componentDidMount(){
        var comments,userInfo;
        $.get("http://localhost:3001/user/getcomment")
        .done((rests)=>{
            comments=rests;
            console.log(comments);
        })
        $.get("http://localhost:3001/user/userData/" + this.state.userID)
        .done((rests)=>{
            userInfo=rests;
            console.log(rests);
        })
        
         $.get("http://localhost:3001/admin/restData")
        .done((rests)=>{
             restaurants=rests;
             console.log(restaurants);
            this.setState({
                userInfo:userInfo,
                comments:comments,
                restaurants:rests,filteredRest:rests, loc:window.location.pathname.split("/")[2]
            })
        })
    }
        /*var y;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            y= this.responseText;
            console.log(y);
        }
    };
    xhttp.open("GET", "http://localhost:8000/admin/restData", true);
    xhttp.send();
    console.log(y);*/
    popupOnClickHandler = e=>{
        let id = e.currentTarget.id.split("popUp_")[1]
        window.history.pushState(null, null, "/user/singleRest/" + id);
        this.setState({ singleRestID: id, loc: "singleRest" });
    }

    render(){
        if(this.state.loc=="map"){
          return(
            <div>
                <Header userID={this.state.userID} logoutHandler={this.props.logoutHandler}/>
                <SearchBar userID={this.state.userID} onChange={this.handleSearchChange} sortOnClick={this.sortOnClick} toggleMapHandler={this.toggleMapHandler} toggleHomeHandler={this.toggleHomeHandler}/>
                <SortButton sortDistance={this.sortDistance} sortPrice={this.sortPrice} sortRate={this.sortRate} sorting={this.state.sorting} sortOpen={this.sortOpen}/>
                {this.state.isToggleHome && <Home userID={this.state.userID} saveHomeHandler={this.saveHomeHandler}></Home>
                }
                <Map filteredRest={this.state.filteredRest} popupOnClickHandler={this.popupOnClickHandler}></Map>
            </div>
            )  
        }
        
        else if(this.state.loc=="singleRest"){
            return(
                <div>
                    <Header userID={this.state.userID} logoutHandler={this.props.logoutHandler}/>
                    <SearchBar userID={this.state.userID} onChange={this.handleSearchChange} sortOnClick={this.sortOnClick} toggleMapHandler={this.toggleMapHandler} toggleHomeHandler={this.toggleHomeHandler}/>
                    <SingleRest userID={this.state.userID} restaurants={this.state.restaurants} restID={this.state.singleRestID} backOnClick={this.backOnClick} singleOnClick={this.singleOnClick} userID={this.state.userID} comments={this.state.comments}/>
                </div>
            )
        }
        else{
            return(
                <div>
                    <Header userID={this.state.userID} logoutHandler={this.props.logoutHandler}/>
                    <SearchBar userID={this.state.userID} onChange={this.handleSearchChange} sortOnClick={this.sortOnClick} toggleMapHandler={this.toggleMapHandler}
                        toggleHomeHandler={this.toggleHomeHandler}/>
                    <SortButton sortDistance={this.sortDistance} sortPrice={this.sortPrice} sortRate={this.sortRate} sorting={this.state.sorting} sortOpen={this.sortOpen}/>
                    {this.state.isToggleHome && <Home userID={this.state.userID} saveHomeHandler={this.saveHomeHandler}></Home>
                    }
                    <Content userID={this.state.userID} restaurants={this.state.filteredRest} singleOnClick={this.singleOnClick} />
                </div>
            )
        }
    }
}

class Header extends React.Component{
    render(){
        return(
        <div className="header">
        <Title/>
        <LoginStatus userID={this.props.userID} logoutHandler={this.props.logoutHandler}/>
        </div>
        );
    }
}

class Title extends React.Component{
    render(){
        return(
        <div>
            <span className="title py-auto">
                <img src="http://localhost:3000/assets/cuhk.png"/><p className="try">Project: Business within 10 km from CUHK</p>
            </span>
        </div>
        );
    }
}

class LoginStatus extends React.Component{
    render(){
        return(
        <div className="status">
        <span>Welcome! {this.props.userID}</span>
        <button className="Logout" onClick={this.props.logoutHandler}> Logout</button>
        </div>
        )
    }
}

class SearchBar extends React.Component{
    render(){
        return(
            <div className="search-bar">
            <i class="fas fa-search fa-lg"></i>
            <select className="searchSelection">
                <option value="0">Search Criteria:</option>
                <option value="1">Restaurant Name</option>
                <option value="2">Restaurant Location</option>
                <option value="3">Food Category</option>
                <option value="4">Price</option>
                <option value="5">Nearby x km to Home Location</option>
              </select>
                <input type="text" className="bar" onChange={this.props.onChange} />
                <i class="fas fa-filter fa-lg" onClick={this.props.sortOnClick}></i>
                <i class="fas fa-map-marked-alt fa-lg" onClick={this.props.toggleMapHandler}></i>
                <i class="fas fa-house-user fa-lg" onClick={this.props.toggleHomeHandler}></i>
            </div>
        );
    }
};

class SortButton extends React.Component{
    render(){
        if (!this.props.sorting)
            return <div/>
        else{
            return(
            <div className="buttonLine">
            Sort By:
            <button className="dntf" onClick={this.props.sortDistance}> Distance (From Near to Far) </button>
            <button className="plth" onClick={this.props.sortPrice}> Price (From Low to High) </button>
            <button className="rlth" onClick={this.props.sortRate}> Rating (From Low to High) </button>
            <br/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button className="dftn" onClick={this.props.sortDistance}> Distance (From Far to Near) </button>
            <button className="phtl" onClick={this.props.sortPrice}> Price (From High to Low) </button>
            <button className="rhtl" onClick={this.props.sortRate}> Rating (From High to Low) </button>
            </div>
            )
        }
    }
}
/*<button className="otc" onClick={this.props.sortOpen}>  From Opened to Closed </button>
            <button className="cto" onClick={this.props.sortOpen}>  From Closed to Opened </button>*/

class Content extends React.Component{
    render(){
        return(
        <div className="flexbox">
        {this.props.restaurants.map(x=>
                        <RestItem name={x.restName} phone={x.restPhone} price={x.restPrice} restImg={x.restImg} openTime={x.restOpen} loc={x.restLocation}  rate={x.restRating} lat={x.restLat} long={x.restLong} open={x.restIsOpen} restImg={x.restImg} distance= {parseInt(x.restDistanceFromCU,10)} viewCount={x.viewCount} favCount={x.favCount} commentCount={x.commentCount} restCat={x.restCat} singleOnClick={this.props.singleOnClick} restID={x.restID}/>
                    )}
        </div>
        )
    }
}

class RestItem extends React.Component{
    onErrorHandler=(event)=>{
        event.target.onerror=null;
        event.target.src="http://localhost:3000/assets/No_image_available.png";
    }
    render(){
        return(
            <div onClick={this.props.singleOnClick} className="restItem" id={this.props.restID}>
                <div className="avatar">
                <img src={this.props.restImg} onError={this.onErrorHandler}/>
                </div>
                <Bookmark id={this.props.restID}/>
                <p className="restName"> {this.props.name}</p> 
                <Rating rate={this.props.rate} price={this.props.price}/>
                <br/>
                <i class="fas fa-location-arrow"></i>
                <p className="restLoc"> {this.props.loc}</p>
                <br/>
                <div className="ddis">
                <i class="fas fa-utensils"></i>
                <p className="restLoc"> "{this.props.restCat}"</p>
                </div>
                <div className="ddis dist">
                    <i class="fas fa-walking"></i>
                    <p className="distance">
                    <i> &nbsp;&nbsp;&nbsp;{this.props.distance} m from CUHK</i></p>
                </div>
            </div>
        )
    }
}

class Opening extends React.Component{
    render(){
        if (this.props.open)
        return(
            <img className="logo" src={OpenedLogo}/>
        );
        else 
            return(
            <img className="logo"src={ClosedLogo}/>
                );
    }
}

class Bookmark extends React.Component{
    mouseover=event=>{
        event.target.className="fas fa-heart fa-2x";
    }
    mouseout=event=>{
        event.target.className="far fa-heart fa-2x";
    }
    render(){
        if(userFav.includes(this.props.id))
            return (
            <i class="fas fa-heart fa-2x"></i>
            )
        else 
            return(
        <i class="far fa-heart fa-2x" onMouseOver={this.mouseover} onMouseOut={this.mouseout}></i>
        )
    }
}

class Rating extends React.Component{
    render(){
        switch(this.props.rate-0){
            case 1:
                return(<div>
                       <i class="fas fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 1.5:
                return(<div>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 2:
                return(<div>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 2.5:
                return(<div>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 3:
                return(<div>
                        <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i> 
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 3.5:
                return(<div>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 4:
                return(<div><i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 4.5:
                return(<div>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;
            case 5:
                return(<div><i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       Price: {this.props.price}
                       </div>
            );
            break;}
    }
}

class SingleRestRating extends React.Component{
    render(){
        switch(this.props.rate-0){
            case 1:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;
            case 1.5:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;
            case 2:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;
            case 2.5:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;
            case 3:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                        <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i> 
                       <i class="far fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;
            case 3.5:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;
            case 4:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="far fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;
            case 4.5:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star-half-alt"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
                       
            );
            break;
            case 5:
                return(<div className="singleRestStart">
                       <p className="singleRestStar">Rating: </p>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       <i class="fas fa-star"></i>
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       </div>
            );
            break;}
    }
}

class SingleRest extends React.Component{
    constructor(props){
        super(props);
        this.state={
            go:123
        };
    }
    favOnClick=(event)=>{
        var restClicked=this.props.restID;
            if(userFav.includes(restClicked)){
                var i=0;
                while (userFav[i]!=restClicked)
                    i++;
                userFav.splice(i,1);
                window.alert("You have REMOVED this restaurants from your Favourite List!");
                var i=0,y;
                while(restaurants[i].restID!=this.props.restID)
                i++;
                restaurants[i].favCount--;
                $.post("http://localhost:3001/user/unfav",{userNickname:this.props.userID,restID:this.props.restID}).done((res)=>{
                if (res=="success"){
                    console.log("Unfavourited!")
                }
                })
            }
            else{
            userFav.push(restClicked);
            window.alert("You have ADDED this restaurant to your Favourite list!");
            var i=0,y;
                while(restaurants[i].restID!=this.props.restID)
                i++;
                restaurants[i].favCount++;}
            $.post("http://localhost:3001/user/fav",{userNickname:this.props.userID,restID:this.props.restID}).done((res)=>{
                if (res=="success"){
                    console.log("Favourited!")
                }
                })
            this.setState({go:123});
    }
    render(){
        var i=0,y,restaurants=this.props.restaurants;
        console.log(restaurants);
        while(restaurants[i].restID!=this.props.restID)
            i++;
        console.log(restaurants[i]);
        return(
        <div className="singleRestaurants"> 
            <button className="back" onClick={this.props.backOnClick}> <i class="fas fa-chevron-circle-left fa-lg"></i> 
            &nbsp;&nbsp;Back </button>
            <h1> {restaurants[i].restName} </h1>
            <div className="singleRestImg">
            <img src={restaurants[i].restImg} />
            </div>
            <div onClick={this.favOnClick}>
            <Bookmark id={restaurants[i].restID} />
            </div>
            <SingleRestRating rate={restaurants[i].restRating}/>
            <br/>
            <div>
            <i class="fas fa-crown"></i>
            &nbsp;&nbsp;&nbsp;
            <p className="singleRestStar">Favourited by &nbsp;{restaurants[i].favCount}&nbsp;users</p>
            </div>
            <br/>
            <div>
            <i class="fas fa-phone-alt fa-lg"></i>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <p className="singleRestStar">Phone: {restaurants[i].restPhone}</p>
            </div>
            <br/>
            <div>
            <i class="fas fa-hand-holding-usd fa-lg"></i>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <p className="singleRestStar">Price: {restaurants[i].price}</p>
            </div>
            <br/>
            <div>
            <i class="fas fa-utensils fa-lg"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <p className="singleRestStar">Categories: {restaurants[i].restCat}</p>
                </div>
            <br/>
            <div>
                <i class="fas fa-walking fa-lg"></i>
                    <p className="singleRestStar">
                    <i> &nbsp;&nbsp;&nbsp;{parseInt(restaurants[i].restDistanceFromCU,10)} m from CUHK</i>
                    </p>
            </div>
            <div className="secondPart">
            <SingleRestLocation restLat={restaurants[i].restLat} restLong={restaurants[i].restLong} loc={restaurants[i].restLocation}/>
            <Comments userID={this.props.userID} restComments={this.props.Comments} commentCount={restaurants[i].commentCount} restID={restaurants[i].restID}/>
            </div>
        </div>    
        )
    }
}
//<Opening open={restaurants[i].restIsOpen}/>

class SingleRestLocation extends React.Component{
    render(){
        return(
            <div className="singleRestMap">
                <i class="fas fa-location-arrow fa-lg"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <h3 className="commentss"> Location: </h3>
                <p className="singleRestAddress"> {this.props.loc}</p>
                <br/>
                <div ref={el => this.mapContainer = el} className="mapContainerB"/>
            </div>
        )
    }
    componentDidMount() {
        const mapB = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.props.restLong, this.props.restLat],
        zoom: 12.5
        });
        var marker = new mapboxgl.Marker()
        .setLngLat([this.props.restLong, this.props.restLat])
        .addTo(mapB);
    }
}
 
class Comments extends React.Component{
    constructor(props){
        super(props);
        this.state={
            commentForm: false,
            comments: this.props.restComments
        };
    }
    addCommentHandler=()=>{
        if (this.state.commentForm)
            this.setState({commentForm:false});
        else
            this.setState({commentForm:true});
    }
    
    addButtonHandler=(event)=>{
        var happy;
        var title=event.target.parentElement.querySelector('.addTopic').value;
        var content=event.target.parentElement.querySelector('.addComment').value;
        var emoji;
        if(event.target.parentElement.querySelector('.addEmoji').checked)
            emoji=0;
        else emoji=1;
        var userID= this.props.userID;
        if(title==""||content==""){
            window.alert('Please fill in both the Subject and Content!');
            return null;}
        var newComment={title:title,content:content,emoji:emoji,userID:userID};
        console.log(newComment);
        if (this.state.comments==undefined)
            happy=[];
        else happy=this.state.comments;
        happy.unshift(newComment);
        console.log(happy);
        $.post("http://localhost:3001/user/comment",{title:title,content:content,emoji:emoji,userNickname:userID,restID:this.props.restID}).done((res)=>{
                if (res=="success"){
                    console.log("Comment Saved to server!")
                }
        this.setState({commentForm:false,comments:happy});
    })}
    
    render(){
        var commentForm=this.state.commentForm;
        return(
            <div className="comments">
            <h3 className="commentss"> Comments ( {this.props.commentCount} )</h3>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button onClick={this.addCommentHandler}> Add comment
            </button>
            <br/>
            <br/>
            { commentForm && <CommentForm onClick={this.addButtonHandler}/>}
            {this.state.comments!=undefined&&this.state.comments.map(x=>
                <CommentItem title={x.title} userID={this.props.userID} content={x.content} emoji={x.emoji}/>
            )}
            </div>
        )
    }
} 

class CommentItem extends React.Component{
    render(){
        return(
            <div>
                    <CommentEmoji emoji={this.props.emoji}/> 
                      <h5 className="commentTexts">{this.props.title}</h5>
                      <h6 className="commentTexts">By {this.props.userID}</h6>
                      <p className="commentTexts">{this.props.content}</p> 
            <br/>
            </div>
        )
    }     
}

class CommentForm extends React.Component{
    render(){
        return(
            <div className="commentForm">
            <p><i class="fas fa-pen"></i><i>Tell Us Your Experience</i>
            </p>
            <p>Subject  </p>
            <input className="addTopic" type="text" name="subject"/>
            <br/>
            <p>Comment </p>
            <textarea className="addComment" name="comment"></textarea>
            <br/>
            <input type="radio" name="emoji" className="addEmoji" value="0" checked/> 
            <i class="far fa-thumbs-up fa-2x"></i>
            <input type="radio" name="emoji" className="addEmoji" value="1" /> 
            <i class="far fa-thumbs-down fa-2x"></i>
            <br/>
            <button className="addButton" onClick={this.props.onClick}> Submit </button>
            </div>
        )
    }
}

class CommentEmoji extends React.Component{
    render(){
        switch(this.props.emoji){
            case 0:
                return(<i class="far fa-thumbs-up fa-4x good"></i>
                )
                break;
            case 1:
                return(<i class="far fa-thumbs-down fa-4x bad"></i>
                )
                break;
        }
    }
}

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: 114.204074184,
            lat: 22.418498326,
            zoom: 11
        };
    }

    componentDidMount() {
        let that = this;
        mapboxgl.accessToken = 'pk.eyJ1IjoiaG90b20iLCJhIjoiY2s5cjNrcnNoMHE4YzNsbzNwYWp4dXh2dCJ9.bF84m9fN0yA7b9YPlzgL8g';
        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });

        let stores = {
            "type": "FeatureCollection",
            "features": []
        }

        for (let rest of restaurants){
            stores.features.push(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            rest.restLong,
                            rest.restLat
                        ]
                    },
                    "properties": {
                        "restName": rest.restName,
                        "restLocation" : rest.restLocation,
                        "restID": rest.restID
                    }
                }
            )
        }

        stores.features.forEach(function (store, i) {
            store.properties.id = i;
        });
        
        map.on('load', function (e) {
            
            map.addLayer({
                "id": "locations",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": stores
                },
                "layout": {
                    "icon-image": "restaurant-15",
                    "icon-allow-overlap": true,
                }
            });

            map.addSource("places", {
                "type": "geojson",
                "data": stores
            });

            buildLocationList(stores);
            addMarkers();
        });

        function addMarkers() {
            stores.features.forEach(function (marker) {
                var el = document.createElement('div');
                el.id = "marker-" + marker.properties.id;
                el.className = 'marker';
                var newMark = el.appendChild(document.createElement('i'));
                marker.className = "fas fa-map-marker";
           
                new mapboxgl.Marker(el, { offset: [0, -23] })
                    .setLngLat(marker.geometry.coordinates)
                    .addTo(map);
               
                el.addEventListener('click', function (e) {
                    flyToStore(marker);
                    createPopUp(marker);
                    var activeItem = document.getElementsByClassName('active');
                    e.stopPropagation();
                    if (activeItem[0]) {
                        activeItem[0].classList.remove('active');
                    }
                    var listing = document.getElementById('listing-' + marker.properties.id);
                    listing.classList.add('active');
                });
            });
        }

       
        function buildLocationList(data) {
            data.features.forEach(function (store, i) {
                var prop = store.properties;
                var listings = document.getElementById('listings');
                var listing = listings.appendChild(document.createElement('div'));
                listing.id = "listing-" + prop.id;
                listing.className = 'item';

                var link = listing.appendChild(document.createElement('a'));
                link.href = '#';
                link.className = 'title';
                link.id = "link-" + prop.id;
                link.innerHTML = prop.restName;

                var details = listing.appendChild(document.createElement('div'));
                details.innerHTML = prop.restLocation;
                                
                link.addEventListener('click', function (e) {
                    for (var i = 0; i < data.features.length; i++) {
                        if (this.id === "link-" + data.features[i].properties.id) {
                            var clickedListing = data.features[i];
                            flyToStore(clickedListing);
                            createPopUp(clickedListing);
                        }
                    }
                    var activeItem = document.getElementsByClassName('active');
                    if (activeItem[0]) {
                        activeItem[0].classList.remove('active');
                    }
                    this.parentNode.classList.add('active');
                });
            });
        }

        function flyToStore(currentFeature) {
            map.flyTo({
                center: currentFeature.geometry.coordinates,
                zoom: 15
            });
        }

        function createPopUp(currentFeature) {
            var popUps = document.getElementsByClassName('mapboxgl-popup');
            if (popUps[0]) popUps[0].remove();
            var popup = new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(currentFeature.geometry.coordinates)
                .setHTML(
                    '<a>' + currentFeature.properties.restName + '</a>')
                .addTo(map);
            popUps[0].id = "popUp_" + currentFeature.properties.restID;//changed
            popUps[0].addEventListener('click', that.props.popupOnClickHandler);
            }
        }


    render() {
        return (
            <div className="mapContainer">
                <div className='sidebar'>
                    <div className="heading">
                        <h1>List of Restaurants</h1>
                    </div>
                    <div id='listings' className='listings'></div>
                </div>
                <div ref={el => this.mapContainer = el} className="map" />
            </div>
        )
    }
}

class Home extends React.Component{

    render(){
        return(
            <div className="homeLocationMap mx-auto">
                <h3 className="commentss">Update Your Home Location</h3>
                <br/>
                <br/>
                <div ref={el => this.mapContainer = el} className="mapContainerC mx-auto"/>
                <pre id="homeCoordinates" className="homeCoordinates"></pre>
                <button className="saveHome" onClick={this.props.saveHomeHandler}>Save</button>
            </div>
         )
    }
    componentDidMount() {
        var coordinates = document.getElementById('homeCoordinates');
        const mapC = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [114.2068,22.4196],
        zoom: 12.5
        });
        var marker = new mapboxgl.Marker({
            draggable:true
        })
        .setLngLat([114.2068,22.4196])
        .addTo(mapC);
        
        function onDragEnd() {
            var lngLat = marker.getLngLat();
            coordinates.style.display = 'block';
            coordinates.innerHTML =
            'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
            }
 
        marker.on('dragend', onDragEnd);
    }
    
}
//---------------------End of User------------------------------------------

//------------------------Admin---------------------------------------------

const VIEW_MAP = {
    "location": "Location Data",
    "user": "User Data",
    "chart": "Show Chart"
}

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loc: window.location.pathname.split("/")[2] || "location"
        }
        window.addEventListener("popstate", () => {
            this.setState({ loc: window.location.pathname.split("/")[2] || "location" });
        });
    }

    onNavButtonClickHandler = e => {
        e.preventDefault();
        window.history.pushState(null, null, "/admin/" + e.currentTarget.id);
        this.setState({
            loc: e.currentTarget.id
        });
    }

    render() {
        return (
            <div className="adminPanel">
                <Admin_Header loc={this.state.loc} onNavButtonClick={this.onNavButtonClickHandler} logoutHandler={this.props.logoutHandler}></Admin_Header>
                <Admin_Main val={this.state.loc} ></Admin_Main>
            </div>
        );
    }
}

class Admin_Header extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand-sm bg-light navbar-light">
                <ul className="navbar-nav">
                    {Object.keys(VIEW_MAP).map(key =>
                        <Admin_PageCtrButton loc={this.props.loc} key={key} val={key} onNavButtonClick={this.props.onNavButtonClick} ></Admin_PageCtrButton>)
                    }
                </ul>
                <Admin_ButtonLogout logoutHandler={this.props.logoutHandler}></Admin_ButtonLogout>
            </nav>
        );
    }
}

class Admin_PageCtrButton extends React.Component {
    render() {
        return (
            <li className={"nav-item " + (this.props.loc == this.props.val ? "active" : "")} id={this.props.val} onClick={this.props.onNavButtonClick}>
                <a className="nav-link" href={"#" + this.props.val}>{VIEW_MAP[this.props.val]}</a>
            </li>
        );
    }
}

class Admin_ButtonLogout extends React.Component {
    render() {
        return (
            <button type="button" className="btn btn-danger" onClick={this.props.logoutHandler}>Logout</button>
        );
    }
}

class Admin_Main extends React.Component {
    render() {
        if (this.props.val == "user") {
            return (<Admin_User></Admin_User>)
        }
        else if (this.props.val == "chart") {
            return (<Admin_Chart></Admin_Chart>)
        }
        else {
            return (<Admin_Location></Admin_Location>)
        }
    }
}

class Admin_Location extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isFlushing : false,
            createDataForm: null,
            editDataForm: null,
            data:null,
            errMsg: null,
            current_id: null,
            file: null,
            label: "Upload a CSV file..."
        };
        this.getRestData=this.getRestData.bind(this);        
    }

    componentDidMount(){
        $.get("http://localhost:3001/admin/restSchema")
            .done((schema) => {
                this.setState({
                    schema: schema
                });
            });
        $.get("http://localhost:3001/admin/restData")
            .done((rests) => {
                this.setState({
                    data: rests
                })
            })
    }

    getRestData(){
        $.get("http://localhost:3001/admin/restData")
            .done((rests) => {
                this.setState({
                    data: rests
                })
            })
    }

    flushDataHandler = () => {
        if(!this.state.isFlushing){
            $("#modalFlushData").modal("show");
        }
    }

    onConfirmFlush = ()=>{
        $("#modalFlushData").modal("hide");
        this.setState({
            isFlushing : true            
        })
        $.post("/admin/flush")
        .done((res) => {
            if (res == "success"){
                $("#modalFlushDataSuccess").modal("show");
                this.getRestData();
                this.setState({
                    isFlushing : false
                });
            }
        });
    }

    onCreateDataButtonClick=()=>{
        let schema = this.state.schema;
        let createDataForm = 
            (<form>
                {schema.map(key=>
                    <div key={key} className="form-group row">
                        <label htmlFor={"createDataForm_"+ key} className="col-sm-3 col-form-label">{key + ":"}</label>
                        <div className="col-sm-9">
                            {
                                key =="restIsOpen"?
                                    <select id={"createDataForm_"+ key} className="form-control">
                                        <option>true</option>
                                        <option>false</option>
                                    </select>:
                                    <input type="text" className="form-control-plaintext border border-primary" id={"createDataForm_" + key}></input>
                            }
                            {
                                key == "restID" || key == "restName" ?
                                    <div id={"errMsg_" + key} className="text-danger"></div> :
                                    null
                            } 
                        </div>                                
                    </div>
                )}
            </form>);
        this.setState({
            createDataForm: createDataForm
        });
        $("#modalCreateData").modal("show");
    }
    
    createDataHandler = async ()=>{
        if ($("#createDataForm_restID").val() === "" || $("#createDataForm_restName").val() === ""){
            if ($("#createDataForm_restID").val() === ""){
                $("#errMsg_restID").html("restID is required");
            }
            if ($("#createDataForm_restName").val() === ""){
                $("#errMsg_restName").html("restName is required");
            }
        }
        else {
            let data ={}
            await this.state.schema.forEach(key => {
                data[key] = $('#createDataForm_' + key).val();
                $('#createDataForm_' + key).val("");
            });
            $("#modalCreateData").modal("hide");
            $.ajax({
                url: "/admin/createRest",
                type: "PUT",
                data: data,
            })
            .done(result=>{
                if(result == "success"){
                    $("#modalSuccess").modal("show");
                    this.getRestData();
                }
                else{
                    this.setState({
                        errMsg: result
                    });
                    $("#modalError").modal("show");                    
                }
            })
        }
    }
    
    fileChangeHandler = e => {
        this.setState({
            file: e.target.files[0],
            label: e.target.files[0].name
        });
    };

    fileSubmitHandler = (e) => {
        e.preventDefault();
        if (this.state.file) {
            let formData = new FormData();
            formData.append("myfile", this.state.file);
            $.ajax({
                url: "/admin/csv_upload",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false
            })
                .done(result => {
                    if (result == "success") {
                        $("#modalSuccess").modal("show");
                        this.getRestData();
                    }
                });
        }
    };

    onEditDataButtonClick= e=>{
        let id = e.target.id.split("buttonEdit_")[1];
        let data = this.state.data.find(rest=>rest.restID === id);
        let schema = this.state.schema;
        this.setState({current_id: data._id},()=>{
            let editDataForm =
                (<form>
                    {schema.map(key =>
                        <div key={key} className="form-group row">
                            <label htmlFor={"editDataForm_" + key} className="col-sm-3 col-form-label">{key + ":"}</label>
                            <div className="col-sm-9">
                                {
                                    key == "restIsOpen" ?
                                        <select id={"editDataForm_" + key} className="form-control" defaultValue={data[key]}>
                                            <option>true</option>
                                            <option>false</option>
                                        </select> :
                                        <input type="text" className="form-control-plaintext border border-primary" id={"editDataForm_" + key} disabled={key == "restID"} ></input>
                                }
                                {
                                    key == "restID" || key == "restName" ?
                                        <div id={"errMsg_" + key} className="text-danger"></div> :
                                        null
                                }
                            </div>
                        </div>
                    )}
                </form>);
            this.setState({ editDataForm: editDataForm },()=>{
                $("#modalEditData").modal("show");
                for(let key of schema){
                    $("#editDataForm_" + key).val(data[key]);
                }
            });
        })
    }

    editDataHandler = async()=>{
        if ($("#editDataForm_restID").val() === "" || $("#editDataForm_restName").val() === "") {
            if ($("#editDataForm_restID").val() === "") {
                $("#errMsg_restID").html("restID is required");
            }
            if ($("#editDataForm_restName").val() === "") {
                $("#errMsg_restName").html("restName is required");
            }
        }
        else {
            let data = {}
            await this.state.schema.forEach(key => {
                data[key] = $('#editDataForm_' + key).val();
            });
            $("#modalEditData").modal("hide");
            $.ajax({
                url: "/admin/editRest/" + this.state.current_id,
                type: "POST",
                data: data,
            })
                .done(result => {
                    if (result == "success") {
                        $("#modalSuccess").modal("show");
                        this.getRestData();
                    }
                    else {
                        this.setState({
                            errMsg: result
                        });
                        $("#modalError").modal("show");
                    }
                })
        }
    }

    deleteDataHandler = e=>{
        this.setState({ current_id: e.target.id.split("buttonDelete_")[1]});
        $("#modalDeleteData").modal("show")
    }

    onConfirmDataDelete = ()=>{
        $.ajax({
            url: "/admin/restData/" + this.state.current_id,
            type: "DELETE"
        })
            .done(result => {
                this.getRestData();
                $("#modalDeleteData").modal("hide")
            }) 
    }

    render(){
        return (
            <div className="ml-3">
                <FlushButton flushDataHandler={this.flushDataHandler} isFlushing={this.state.isFlushing}></FlushButton>
                <Modal id="modalFlushData" title="Warning" content="Please confirm to flush data." secondButton="Confirm" onClick={this.onConfirmFlush} ></Modal>
                <Modal id="modalFlushDataSuccess" title="Success" content="Flush data successfully."></Modal>
                <Modal id="modalSuccess" title="Success" content="Success!!"></Modal>
                <Modal id="modalError" title="Error" content={this.state.errMsg}></Modal>                                                                
                <CreateData onCreateDataButtonClick={this.onCreateDataButtonClick}></CreateData>
                <Modal id="modalCreateData" title="Create Data" content={this.state.createDataForm} secondButton="Create" onClick={this.createDataHandler} ></Modal>                
                <Modal id="modalEditData" title="Edit Data" content={this.state.editDataForm} secondButton="Save" onClick={this.editDataHandler} ></Modal>                
                <Modal id="modalDeleteData" title="Warning" content="Please confirm to delete data." secondButton="Confirm" onClick={this.onConfirmDataDelete} ></Modal>
                <CSVFileUpload fileChangeHandler={this.fileChangeHandler} fileSubmitHandler={this.fileSubmitHandler} label={this.state.label} ></CSVFileUpload>
                <Admin_LocationData data={this.state.data} onEditDataButtonClick={this.onEditDataButtonClick} deleteDataHandler={this.deleteDataHandler} schema={this.state.schema} ></Admin_LocationData>
            </div>
        );
    }
}

class FlushButton extends React.Component{
    render(){
        let contentFlushButton = 
            this.props.isFlushing?
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only">Loading...</span>
                </div>:
                "Flush Data";
        return(
            <button id="flushButton" type="button" className="btn btn-warning" onClick={this.props.flushDataHandler} >{contentFlushButton}</button>
        );
    }
}

class CreateData extends React.Component{
    render(){
        return(
            <button id="addDataButton" type="button" className="btn btn-primary" onClick={this.props.onCreateDataButtonClick} >Create data</button>
        )
    }
}

class CSVFileUpload extends React.Component{
     render() {
        return (
            <form onSubmit={this.props.fileSubmitHandler}>
                <div className="d-inline-flex">
                    <div className="custom-file ">
                        <input id="fileUpload" className="custom-file-input" type="file" accept=".csv" onChange={this.props.fileChangeHandler} />
                        <label className="custom-file-label" htmlFor="fileUpload">{this.props.label}</label>
                    </div>
                    <div>
                        <input className="btn btn-light" type="submit" value="Upload"/>
                    </div>
                </div>
            </form>
        );
    }
}

class Admin_LocationData extends React.Component{
    constructor(props){
        super(props);
        this.state={
            data: [],
            currentPage: window.location.pathname.split("/")[4] || 1,
            maxPage:1,
            shownData : [],
            filter: ""
        };
        window.addEventListener("popstate", () => {
            this.setState({ currentPage: window.location.pathname.split("/")[4] || 1 },()=>{
                let p = this.state.currentPage;
                this.setState({
                    maxPage: Math.ceil(this.state.data.length / 10),
                    shownData: this.state.data.slice((p - 1) * 10, p * 10)
                })
                if(p > Math.ceil(this.state.data.length / 10) && p > 1) {
                this.setState({ currentPage: p - 1 });
                }       
            });
        });
    }

    componentDidUpdate(prevProps){
        if (this.props.data && this.props.data !== prevProps.data){
            this.setState({
                data: this.dataFilter(this.state.filter)
            }, () => {
                let p = this.state.currentPage;
                this.setState({
                    maxPage: Math.ceil(this.state.data.length / 10),
                    shownData: this.state.data.slice((p - 1) * 10, p * 10)
                })
                if (p > Math.ceil(this.state.data.length / 10) && p > 1) {
                    this.setState({ currentPage: p - 1 });
                }
            });
        }
    }

    dataFilter = searchText=>{
        return this.props.data.filter(rest => {
            if (rest.restID.includes(searchText)) {
                return true;
            }
            return false;
        });
    }

    searchChangeHandler = e=>{
        this.setState({
            data: this.dataFilter(e.target.value),
            filter: e.target.value
        },()=>{
            let p = this.state.currentPage; 
            this.setState({
                maxPage: Math.ceil(this.state.data.length / 10),
                shownData: this.state.data.slice((p - 1) * 10, p * 10)
            })
            if (p > Math.ceil(this.state.data.length / 10) && p > 1) {
                this.setState({ currentPage: p - 1 });
            }
        });
    }

    changePageHandler = e=>{
        let p = e.target.value.split(" ")[1];
        this.setState({
            currentPage: p,
            shownData: this.state.data.slice((p - 1) * 10, p * 10)            
        });
        window.history.pushState(null, null, "/admin/location/page/" + p)

    }

    render(){
        return (            
            <div className="my-1">
                <div className="d-inline-flex">
                    <AdminSearchBar onChange={this.searchChangeHandler} placeholder="Search by restID"></AdminSearchBar>
                    <Pagination currentPage={this.state.currentPage} changePageHandler={this.changePageHandler} maxPage={this.state.maxPage}></Pagination>
                </div>
                {this.state.shownData.map((rest,index) => 
                    <DataCard key={index} data={rest} onEditDataButtonClick={this.props.onEditDataButtonClick} deleteDataHandler={this.props.deleteDataHandler} schema={this.props.schema} datatype="location"></DataCard>
                )}
            </div>
        );
    }    
}

class AdminSearchBar extends React.Component{
    render(){
        return(
            <div className="form-group">
                <input className="form-control" type="text" onChange={this.props.onChange} placeholder={this.props.placeholder} />
            </div>
        );
    }
}

class Pagination extends React.Component{
    render(){
        var pageArr = Array.from(Array(this.props.maxPage == 0? 1 :this.props.maxPage).keys());
        return (
            <div className="d-inline-flex">
                <select id="page" className="form-control" onChange={this.props.changePageHandler} value={"Page " + this.props.currentPage}>
                    {pageArr.map(i=>
                        <option key={i}>Page {i+1}</option>
                    )}
                </select>
            </div>
        );
    }
}

class DataCard extends React.Component{
    render(){
        let tmpData = this.props.data;
        let tmpSchema = this.props.schema;
        tmpSchema = ["_id"].concat(tmpSchema);
        let buttonID;

        if(this.props.datatype == "location"){
            buttonID = this.props.data.restID;
            if (tmpData.restIsOpen) {
                tmpData.restIsOpen = "true"
            }
            else if (tmpData.restIsOpen === null) {
                tmpData.restIsOpen = "null"
            }
            else if (tmpData.restIsOpen == "FALSE") {
                tmpData.restIsOpen = "false"
            }
        }
        else{
            buttonID = this.props.data._id;
        }
        
        return(
            <div className="card border-primary my-2 mr-2">
                <div className="card-body">
                    <div className="card-text">
                        <table className="table d-flex flex-column">
                            <tbody>
                                {
                                    this.props.data && this.props.schema?
                                        tmpSchema.map(key =>
                                        <tr key={key} className="d-flex"><th scope="row" className="text-danger">{key + ":"}</th>
                                                <td className="text-secondary" style={{ maxWidth: "80%" }}>{tmpData[key] === null ? "null" : (typeof (tmpData[key]) == "object" ? tmpData[key].toString(',') : tmpData[key]) }</td></tr>) 
                                        : null
                                }
                            </tbody>
                        </table>
                        
                    </div>
                    <button type="button" id={"buttonDelete_" + buttonID} className="btn btn-danger float-right" onClick={this.props.deleteDataHandler}>Delete</button>
                    <button type="button" id={"buttonEdit_" + buttonID} className="btn btn-warning float-right" onClick={this.props.onEditDataButtonClick}>Edit</button>
                </div>
            </div>
        );
    }
}

class Admin_User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            createDataForm: null,
            editDataForm: null,
            data: null,
            errMsg: null,
            current_id: null
        };
        this.getUserData = this.getUserData.bind(this);
    }

    componentDidMount() {
        $.get("http://localhost:3001/admin/userSchema")
            .done((schema) => {
                this.setState({
                    schema: schema
                });
            });
        $.get("http://localhost:3001/admin/userData")
            .done((users) => {
                this.setState({
                    data: users
                })
            })
    }

    getUserData() {
        $.get("http://localhost:3001/admin/userData")
            .done((users) => {
                this.setState({
                    data: users
                })
            })
    }

    onCreateDataButtonClick = () => {
        let schema = this.state.schema;
        let createDataForm =
            (<form>
                {schema.map(key =>
                    <div key={key} className="form-group row">
                        <label htmlFor={"createDataForm_" + key} className="col-sm-3 col-form-label">{key + ":"}</label>
                        <div className="col-sm-9">
                            <input type="text" className="form-control-plaintext border border-primary" id={"createDataForm_" + key}></input>
                            {
                                key == "userLoginID" || key == "userPW" || key == "userNickname"?
                                    <div id={"errMsg_" + key} className="text-danger"></div> :
                                    null
                            }
                        </div>
                    </div>
                )}
            </form>);
        this.setState({
            createDataForm: createDataForm
        });
        $("#modalCreateData").modal("show");
    }

    createDataHandler = async () => {        
        let uid = $("#createDataForm_userLoginID").val(),
            pw = $("#createDataForm_userPW").val(),
            nick = $("#createDataForm_userNickname").val(),
            pass = true;

        if (uid === "") {
            $("#errMsg_userLoginID").html("userLoginID is required");
            pass = false;
        }
        else if (uid.length < 4 || uid.length > 20) {
            $("#errMsg_userLoginID").html("userLoginID should be 4-20 characters");
            pass = false;
        }
        else{
            $("#errMsg_userLoginID").html(null);
        }

        if (pw === "") {
            $("#errMsg_userPW").html("userPW is required");
            pass = false;
        }
        else if (pw.length < 4 || pw.length > 20) {
            $("#errMsg_userPW").html("userPW should be 4-20 characters");
            pass = false;
        }
        else{
            $("#errMsg_userPW").html(null);
        }

        if (nick === "") {
            $("#errMsg_userNickname").html("userNickname is required");
            pass = false;
        }
        else{
            $("#errMsg_userNickname").html(null);
        }

        if(pass) {
            let data = {}
            await this.state.schema.forEach(key => {
                data[key] = $('#createDataForm_' + key).val();
                $('#createDataForm_' + key).val("");
            });
            $("#modalCreateData").modal("hide");
            $.ajax({
                url: "https://localhost:3001/admin/createUser",
                type: "PUT",
                data: data,
            })
                .done(result => {
                    if (result == "success") {
                        $("#modalSuccess").modal("show");
                        this.getUserData();
                    }
                    else {
                        this.setState({
                            errMsg: result
                        });
                        $("#modalError").modal("show");
                    }
                })
        }
    }

    onEditDataButtonClick = e => {
        let id = e.target.id.split("buttonEdit_")[1];
        let data = this.state.data.find(user => user._id === id);
        console.log(data);
        let schema = this.state.schema;
        this.setState({ current_id: data._id },()=>{
            let editDataForm =
                (<form>
                    {schema.map(key =>
                        <div key={key} className="form-group row">
                            <label htmlFor={"editDataForm_" + key} className="col-sm-3 col-form-label">{key + ":"}</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control-plaintext border border-primary" id={"editDataForm_" + key} ></input>
                                {
                                    key == "userLoginID" || key == "userPW" || key == "userNickname" ?
                                        <div id={"errMsg_" + key} className="text-danger"></div> :
                                        null
                                }
                            </div>
                        </div>
                    )}
                </form>);
            this.setState({ editDataForm: editDataForm },()=>{
                $("#modalEditData").modal("show");
                $("#errMsg_userPW").html("Leave userPW empty to remain pw unchanged");
                for(let key of schema){
                    $("#editDataForm_" + key).val(key == "userPW" ? null : data[key]);
                }
            });
        })
        
    }

    editDataHandler = async () => {
        let uid = $("#editDataForm_userLoginID").val(),
            pw = $("#editDataForm_userPW").val(),
            nick = $("#editDataForm_userNickname").val(),
            pass = true;

        if (uid === "") {
            $("#errMsg_userLoginID").html("userLoginID is required");
            pass = false;
        }
        else if (uid.length < 4 || uid.length > 20){
            $("#errMsg_userLoginID").html("userLoginID should be 4-20 characters");
            pass = false;
        }
        else{
            $("#errMsg_userLoginID").html(null);
        }
        
        if (pw == ""){
            $("#errMsg_userPW").html("Leave userPW empty to remain pw unchanged");
        }
        else if (pw.length < 4 || pw.length > 20) {
            $("#errMsg_userPW").html("userPW should be 4-20 characters");
            pass = false;
        }
        else{
            $("#errMsg_userPW").html(null);
        }

        if (nick === "") {
            $("#errMsg_userNickname").html("userNickname is required");
            pass = false;
        }
        else{
            $("#errMsg_userNickname").html(null);
        }
        

        if(pass) {
            let data = {}
            await this.state.schema.forEach(key => {
                data[key] = $('#editDataForm_' + key).val();
            });
            $("#modalEditData").modal("hide");
            $.ajax({
                url: "/admin/editUser/" + this.state.current_id,
                type: "POST",
                data: data,
            })
                .done(result => {
                    if (result == "success") {
                        $("#modalSuccess").modal("show");
                        this.getUserData();
                    }
                    else {
                        this.setState({
                            errMsg: result
                        });
                        $("#modalError").modal("show");
                    }
                })
        }
    }

    deleteDataHandler = e => {
        this.setState({ current_id: e.target.id.split("buttonDelete_")[1]});
        $("#modalDeleteData").modal("show");
    }

    onConfirmDataDelete = ()=>{
        $.ajax({
            url: "/admin/userData/" + this.state.current_id,
            type: "DELETE"
        })
            .done(result => {
                this.getUserData();
                $("#modalDeleteData").modal("hide");
            })
    }

    render() {
        return (
            <div className="ml-3">
                <Modal id="modalSuccess" title="Success" content="Success!!"></Modal>
                <Modal id="modalError" title="Error" content={this.state.errMsg}></Modal>
                <CreateData onCreateDataButtonClick={this.onCreateDataButtonClick}></CreateData>
                <Modal id="modalCreateData" title="Create Data" content={this.state.createDataForm} secondButton="Create" onClick={this.createDataHandler} ></Modal>
                <Modal id="modalEditData" title="Edit Data" content={this.state.editDataForm} secondButton="Save" onClick={this.editDataHandler} ></Modal>
                <Modal id="modalDeleteData" title="Warning" content="Please confirm to delete data." secondButton="Confirm" onClick={this.onConfirmDataDelete} ></Modal>
                <Admin_UserData data={this.state.data} onEditDataButtonClick={this.onEditDataButtonClick} deleteDataHandler={this.deleteDataHandler} schema={this.state.schema} ></Admin_UserData>
            </div>
        );
    }
}

class Admin_UserData extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            currentPage: window.location.pathname.split("/")[4] || 1,
            maxPage: 1,
            filter: "",
            shownData: []
        };
        window.addEventListener("popstate", () => {
            this.setState({ currentPage: window.location.pathname.split("/")[4] || 1 }, () => {
                let p = this.state.currentPage;
                this.setState({
                    maxPage: Math.ceil(this.state.data.length / 10),
                    shownData: this.state.data.slice((p - 1) * 10, p * 10)
                })
                if (p > Math.ceil(this.state.data.length / 10) && p > 1) {
                    this.setState({ currentPage: p - 1 });
                }
            });
        });
    }

    componentDidMount() {
        $.get("http://localhost:3001/admin/userData")
            .done((users) => {
                if (users) {
                    this.setState({
                        data: users,
                        maxPage: Math.ceil(users.length / 10),
                        shownData: users.slice(0, 10)
                    })
                }
            })
    }

    componentDidUpdate(prevProps) {
        if (this.props.data && this.props.data !== prevProps.data) {
            this.setState({
                data: this.dataFilter(this.state.filter)
            }, () => {
                let p = this.state.currentPage;
                this.setState({
                    maxPage: Math.ceil(this.state.data.length / 10),
                    shownData: this.state.data.slice((p - 1) * 10, p * 10)
                })
                if (p > Math.ceil(this.state.data.length / 10) && p > 1) {
                    this.setState({ currentPage: p - 1 });
                }
            });
        }
    }

    dataFilter = searchText => {
        return this.props.data.filter(user => {
            if (user.userLoginID.includes(searchText)) {
                return true;
            }
            return false;
        });
    }

    searchChangeHandler = e => {
        this.setState({
            data: this.dataFilter(e.target.value),
            filter: e.target.value
        }, () => {
            let p = this.state.currentPage;
            this.setState({
                maxPage: Math.ceil(this.state.data.length / 10),
                shownData: this.state.data.slice((p - 1) * 10, p * 10)
            })
            if (p > Math.ceil(this.state.data.length / 10) && p > 1) {
                this.setState({ currentPage: p - 1 });
            }
        });
    }

    changePageHandler = e => {
        let p = e.target.value.split(" ")[1];
        this.setState({
            currentPage: p,
            shownData: this.state.data.slice((p - 1) * 10, p * 10)
        });
        window.history.pushState(null, null, "/admin/user/page/" + p)

    }

    render() {
        return (
            <div className="my-1">
                <div className="d-inline-flex">
                    <AdminSearchBar onChange={this.searchChangeHandler} placeholder="Search by userLoginID"></AdminSearchBar>
                    <Pagination currentPage={this.state.currentPage} changePageHandler={this.changePageHandler} maxPage={this.state.maxPage}></Pagination>
                </div>
                {this.state.shownData.map((user, index) =>
                    <DataCard key={index} data={user} onEditDataButtonClick={this.props.onEditDataButtonClick} deleteDataHandler={this.props.deleteDataHandler} schema={this.props.schema} datatype="user"></DataCard>
                )}
            </div>
        );
    }
}

class Admin_Chart extends React.Component {
    constructor(props){
        super(props);
        this.state={
            loc : window.location.pathname.split("/")[3] || "comment"            
        }
        window.addEventListener("popstate", () => {
            this.setState({ loc: window.location.pathname.split("/")[3] || "comment" });
        });
    }

    onNavButtonClickHandler = e => {
        e.preventDefault();
        window.history.pushState(null, null, "/admin/chart/" + e.currentTarget.id);
        this.setState({
            loc: e.currentTarget.id
        });
    }

    render() {
        return (
            <div className="chartPanel">
                <Admin_ChartHeader loc={this.state.loc} onNavButtonClick={this.onNavButtonClickHandler}></Admin_ChartHeader>
                <Admin_ChartMain val={this.state.loc}></Admin_ChartMain>
            </div>
        );
    }
}

const CHART_MAP={
    "comment": "Top 5 Active User With Comments",
    "fav": "Top 5 Active User With Favourite"
}

class Admin_ChartHeader extends React.Component{
    render() {
        return (
            <nav className="navbar navbar-expand-sm bg-light navbar-light">
                <ul className="navbar-nav">
                    {Object.keys(CHART_MAP).map(key =>
                        <Admin_ChartCtrl loc={this.props.loc} key={key} val={key} onNavButtonClick={this.props.onNavButtonClick} ></Admin_ChartCtrl>)
                    }
                </ul>
            </nav>
        );
    }
}

class Admin_ChartCtrl extends React.Component{
    render() {
        return (
            <li className={"nav-item " + (this.props.loc == this.props.val ? "active" : "")} id={this.props.val} onClick={this.props.onNavButtonClick}>
                <a className="nav-link" href={"#" + this.props.val}>{CHART_MAP[this.props.val]}</a>
            </li>
        );
    }

}

class Admin_ChartMain extends React.Component{
    render(){
        if (this.props.val == "fav"){
            return <Admin_FavChart></Admin_FavChart>;
        }
        else {
            return <Admin_CommentChart></Admin_CommentChart>
        }
    }
}

class Admin_CommentChart extends React.Component {
    constructor(props){
        super(props)
        this.state = {commentData: null};
    }
    
    componentDidMount(){
        $.get("http://localhost:3001/admin/chart/data/comment")
        .done(result=>{
            if(result != "Error"){
                this.setState({commentData: result})
                let label_utc =[], dataset_utc =[];
                for (let data of result) {
                    label_utc.push(data.userLoginID);
                    dataset_utc.push(data.commentCount);
                }
                let utc = $("#userTopCommentChart");
                var myBarChart = new Chart(utc, {
                    type: 'bar',
                    data: {
                        labels: label_utc,
                        datasets: [{
                            label: 'number of comments',
                            data: dataset_utc,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        },
                        title: {
                            display: true,
                            text: 'Top 5 Active User With Comments'
                        }
                    }
                });
            }
        })
    }

    render() {
        return (
            <div className="chart-container" style={{ position: "relative", height: "40vh", width: "80vw" }}>
                <canvas id="userTopCommentChart"></canvas>
            </div>
        )
    }
}

class Admin_FavChart extends React.Component{
    constructor(props) {
        super(props)
        this.state = { favData: null };
    }

    componentDidMount(){
        $.get("http://localhost:3001/admin/chart/data/fav")
            .done(result => {
                if (result != "Error") {
                    this.setState({ favData: result })
                    let label_utc = [], dataset_utc = [];
                    for (let data of result) {
                        label_utc.push(data.userLoginID);
                        dataset_utc.push(data.favCount);
                    }
                    let utc = $("#userTopFavChart");
                    var myBarChart = new Chart(utc, {
                        type: 'bar',
                        data: {
                            labels: label_utc,
                            datasets: [{
                                label: 'number of favourites',
                                data: dataset_utc,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)'
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Top 5 Active User With Favourite'
                            }
                        }
                    });
                }
        })
    }

    render(){
        return (
            <div className="chart-container" style={{ position: "relative", height: "40vh", width: "80vw" }}>
                <canvas id="userTopFavChart"></canvas>
            </div>
        )
    }
}

class Modal extends React.Component {
    render() {
        let secondButton = this.props.secondButton &&
            <button type="button" className="btn btn-primary" onClick={this.props.onClick}>{this.props.secondButton}</button>;
        return (
            <div className="modal fade" id={this.props.id} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.title}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {this.props.content}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            {secondButton}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
//------------------------------------Admin End----------------------------------
/*
                <div >
                <i class="fas fa-external-link-alt fa-lg"></i>
            &nbsp;&nbsp;&nbsp;&nbsp;
                <a href={restaurants[i].restURL} className="singleRestStar"> Click here to see more </a>
                </div>
                <i class="fas fa-location-arrow"></i>
                <p className="restLoc"> {this.props.loc}</p>
                <br/>
                <div className="ddis">
                <i class="fas fa-utensils"></i>
                <p className="restLoc"> "{this.props.restCat}"</p>
                </div>
                <div className="ddis dist">
                    <i class="fas fa-walking"></i>
                    <p className="distance">
                    <i> &nbsp;&nbsp;&nbsp;{this.props.distance} m from CUHK</i></p>
                </div>*/
ReactDOM.render(<App/>, document.querySelector("#app"));