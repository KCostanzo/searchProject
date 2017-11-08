import React from 'react';
import ReactDOM from 'react-dom';

class SearchBox extends React.Component {
	constructor(props) {
  	super(props)
    this.handleInput = this.handleInput.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.populateResponseArray = 	this.populateResponseArray.bind(this);
    this.itemClicked = this.itemClicked.bind(this);
    this.nextVal = this.nextVal.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    
    this.state = {
    	searchVal: '', searchItems: [], errors: '', tokenized: '', selectedIdx: null,
    }
  }
  
  componentDidMount() {
  	document.addEventListener('mouseup',this.handleOutsideClick);
    document.addEventListener('keydown',this.handleKeydown);
    //remember window.addEventListener
  }
  
	handleKeydown(e) {
  	//console.log(e);
    //tab and down arrow select next li, up arrow selects previous, enter sends selected to itemClicked
    switch(e.keyCode) {
    	case 9:
	      e.preventDefault()
      	this.nextVal()
        break;
      case 40: 
      	this.nextVal();
        break;
       case 38:
	      e.preventDefault();
       	this.prevVal();
        break;
       case 13:
       console.log('enter');
       	this.itemClicked(this.state.searchItems[this.state.selectedIdx]);
        break;
    	default:
      	break;
    }
  }
  
  nextVal() {
  	console.log('nextval');
    if (this.state.selectedIdx === null) {
    	this.setState({selectedIdx: 0});
    } else {
    	this.setState({selectedIdx: this.state.selectedIdx + 1});
      if (this.state.selectedIdx >= this.state.searchItems.length) {
      this.setState({selectedIdx: 0})
      }
    }
    //console.log(this.state.selectedIdx);
  }
  
  prevVal() {
  console.log('prev');
  	if (this.state.selectedIdx === null) {
    	this.setState({selectedIdx:this.state.searchItems.length-1});
    } else {
    	this.setState({selectedIdx: this.state.selectedIdx - 1});
      	if (this.state.selectedIdx < 0) {
      this.setState({selectedIdx: this.state.searchItems.length-1})
     	 }
    }
    //console.log(this.state.selectedIdx);
  }
  
  handleInput(e) {
  	this.setState({searchVal: e.target.value, tokenized: ''}, () => {
       //console.log(this.state.searchVal);
				let reqVal = '';
        for (let i=0; i<this.state.searchVal.length; i++) {
        	if (this.state.searchVal[i] === ' ') {
          	//this.setState({tokenized: (reqVal + ' ')});
            this.state.tokenized += (reqVal + ' ');
          	reqVal = '';
            //console.log(this.state.tokenized);
          } else {
          	reqVal += this.state.searchVal[i];
          }
        }

        this.populateResponseArray(getSuggestions(reqVal));
    });
  }
  
  populateResponseArray(responseData) {
		responseData.then(result => {
    	console.log(result);
	  	this.setState({searchItems: result});
    }).catch(error => {
    	console.log('error');
    	this.setState({errors: error});
    });
  }
  
  selected(idx,node) {
		//console.log(idx);
    //console.log(node);
    if (node) {
    	if (idx === this.state.selectedIdx) {
    	//console.log('matched');
      node.style.background = '#F0F8FF';
      node.style.textDecoration = 'underline';
      } else {
     	node.style.background = null;
      node.style.textDecoration=null;
     }
    }
  }
  
  displayItems() {
  	if (this.state.searchItems.length === 0) {
    	return <div/>;
    }
   // console.log('display');
  	return(
    	this.state.searchItems.map((item,idx) => {
      //console.log(idx);
      	return<li ref={this.selected.bind(this,idx)} onClick={() => {this.itemClicked(item)}} key={item}>{item}</li>;
    	})
    );
  }
  
  itemClicked(item) {
  	//console.log('item clicked');
    console.log(item);
    //console.log(this.state.tokenized);
    this.setState({searchVal: (this.state.tokenized + item + " "), searchItems: []});
    this.setState({tokenized: ''});
    document.getElementById('searchBox').focus();
  }
  
  errorDisplay() {
    //console.log(this.state.errors);
  	if (this.state.errors !== '') {
      return(
      	<a id='errs'>{this.state.errors}</a>
      );
    };
  }
  
	setWrapper(node) {
  	this.wrapper = node;
    //console.log(node);
  }
  
	handleOutsideClick(e) {
  	if (this.wrapper && !this.wrapper.contains(e.target)) {
      console.log('close');
      this.setState({searchItems: []});
			document.getElementById('searchBox').focus();
      
      //alternatively, could set node style to display:none but would have to include fn to reset display, probly with display bool in state
    }
  }

  render() {
    return (
      <div>
        <input id='searchBox' value={this.state.searchVal} autoComplete='off' onChange={this.handleInput} />
        
          {this.errorDisplay()}
        <ul ref={this.setWrapper.bind(this)} id='displayContent'>
          {this.displayItems()}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(
	<SearchBox name="Search" />,
  document.getElementById('main')
);

// ================================= Mock Server Start 

var FAILURE_COEFF = 10;
var MAX_SERVER_LATENCY = 200;

function getRandomBool(n) {
  var maxRandomCoeff = 1000;
  if (n > maxRandomCoeff) n = maxRandomCoeff;
  return Math.floor(Math.random() * maxRandomCoeff) % n === 0;
}

function getSuggestions(text) {
	//console.log('getSuggestions');
  var pre = 'pre';
  var post = 'post';
  var results = [];
  if (getRandomBool(2)) {
    results.push(pre + text);
  }
  if (getRandomBool(2)) {
    results.push(text);
  }
  if (getRandomBool(2)) {
    results.push(text + post);
  }
  if (getRandomBool(2)) {
    results.push(pre + text + post);
  }
  return new Promise((resolve, reject) => {
    var randomTimeout = Math.random() * MAX_SERVER_LATENCY;
    setTimeout(() => {
      if (getRandomBool(FAILURE_COEFF)) {
        reject();
      } else {
        resolve(results);
      }
    }, randomTimeout);
  });
}