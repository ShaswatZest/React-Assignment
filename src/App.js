import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Route} from 'react-router-dom';
import StarRatings from 'react-star-ratings';
import { ReactComponent as Close } from './cancel.svg';

class App extends React.Component {
     constructor(props) {
          super(props);
          this.state = {
               showInfo: false,
               search:false,
               showMovies:true,
               showSeries: false,
               error: null,
               isLoaded: false,
               movies: [],
               series: [],
               searchItems: [],
               modalState: [],
               genres: [],
               searchText: "",
               componentGenres: ""
          };
          fetch("https://api.themoviedb.org/3/genre/movie/list?&api_key=699aa1f6bb0b3f6a60e074824770ac61")
               .then(res => res.json())
               .then(
                    (result) => {
                         this.setState({
                              isLoaded: true,
                              genres: result.genres
                         });
                    },
                    (error) => {
                         this.setState({
                              isLoaded: true,
                              error
                         });
                    }
               )
     }

     sendGenres(genreIds) {
          let genre = "";
          for(let i of this.state.genres) {
               console.log(i);
               for(let j of genreIds) {
                    console.log(j);
                    if(i.id == j) {
                         genre += (i.name + " / ")
                    }
               }
          }
          this.setState(state => ({
               componentGenres: genre.substring(0, genre.length - 3)
          }));
     }

     hideModal() {
          this.setState(state => ({
               showInfo: false
          }));
     }

     showMovies() {
          this.setState(state => ({
               showMovies: true,
               showSeries: false,
               search: false,
               searchItems: []
          }));
     }

     showSeries() {
          this.setState(state => ({
               showMovies: false,
               showSeries: true,
               search: false,
               searchItems: []
          }));
     }

     showModal(item) {
          item.vote_average = item.vote_average / 2;
          item.genre_ids = this.sendGenres(item.genre_ids);
          console.log(item);
          this.setState(state => ({
               showInfo: true,
               modalState: item
          }));
     }

     changeSearchText = (event) => {
          this.setState({
               searchText: event.target.value
          });
     }

     submit() {
          this.setState({
               search: true
          });
          let search = this.state.searchText
          let url=''
          if(this.state.showMovies) {
               url=`https://api.themoviedb.org/3/search/movie?api_key=699aa1f6bb0b3f6a60e074824770ac61&query=${search}&page=`
          } else {
               url=`https://api.themoviedb.org/3/search/tv?api_key=699aa1f6bb0b3f6a60e074824770ac61&query=${search}&page=`
          }
          for(let i = 1; i <= 2; i++) {
               let newUrl = url + i;
               fetch(newUrl)
                    .then(res => res.json())
                    .then(
                         (result) => {
                              var search = this.state.searchItems;
                              search = [...search, ...result.results];
                              this.setState({
                                   isLoaded: true,
                                   searchItems: search
                              });
                         },
                         (error) => {
                              this.setState({
                                   isLoaded: true,
                                   error
                              });
                         }
                    )
          }
     }



     componentDidMount() {
          for(let i = 1; i <= 3; i++) {
               let newUrl = "https://api.themoviedb.org/3/discover/movie?api_key=699aa1f6bb0b3f6a60e074824770ac61&page=" + i;
               fetch(newUrl)
                    .then(res => res.json())
                    .then(
                         (result) => {
                              var newItems = this.state.movies;
                              newItems = [...newItems, ...result.results];
                              this.setState({
                                   isLoaded: true,
                                   movies: newItems
                              });
                         },
                         (error) => {
                              this.setState({
                                   isLoaded: true,
                                   error
                              });
                         }
                    )
          }

          for(let i = 1; i <= 3; i++) {
               let newUrl = "https://api.themoviedb.org/3/discover/tv?api_key=699aa1f6bb0b3f6a60e074824770ac61&page=" + i;
               fetch(newUrl)
                    .then(res => res.json())
                    .then(
                         (result) => {
                              result.results.forEach(object => {
                                   object['release_date'] = object['first_air_date']
                                   object['original_title'] = object['original_name']
                                   delete object['first_air_date']
                                   delete object['original_name']
                                   return object
                              });
                              var newItems = this.state.series;
                              newItems = [...newItems, ...result.results];
                              this.setState({
                                   isLoaded: true,
                                   series: newItems
                              });
                         },
                         (error) => {
                              this.setState({
                                   isLoaded: true,
                                   error
                              });
                         }
                    )
          }

     }

     render() {
               const { error, isLoaded, movies, series, searchItems } = this.state;
               const static_url = "https://image.tmdb.org/t/p/w500/";
               if(error) {
                    return <div>Error: {error.message}</div>;
               } else if(!isLoaded) {
                    return <div>Loading....</div>
               } else {
                    return (
                         <>
                         <div className = "navbar">
                              <div className="nav-item" onClick={()=>this.showMovies()} style={{ borderBottom: this.state.showMovies ? "3px solid #ffc107" : "0px" }}>Movies</div>
                              <div></div>
                              <div className="nav-item" onClick={()=>this.showSeries()} style={{ borderBottom: this.state.showSeries ? "3px solid #ffc107" : "0px" }}>Series</div>
                              <div></div>
                              <div className="nav-item right">
                                   <input type="text" value={this.state.searchText} onChange={this.changeSearchText} ></input>
                                   <button onClick={()=>this.submit()}>search</button>
                              </div>
                         </div>
                         <div className = "items" style={{ display: (!this.state.search &&this.state.showMovies) ? "grid" : "none" }}>
                              {movies.map(item => (
                                   <div className = "item-cards" key={item.original_title} onClick={()=>this.showModal(item)}>
                                        <img src = {static_url + item.poster_path} />
                                        <div className="item-cards-title">{item.original_title}</div>
                                        <div className="item-cards-year">{item.release_date}</div>
                                   </div>
                              ))}
                         </div>
                         <div className = "items" style={{ display: (!this.state.search &&this.state.showSeries) ? "grid" : "none" }}>
                              {series.map(item => (
                                   <div className = "item-cards" key={item.original_title} onClick={()=>this.showModal(item)}>
                                        <img src = {static_url + item.poster_path} />
                                        <div className="item-cards-title">{item.original_title}</div>
                                        <div className="item-cards-year">{item.release_date}</div>
                                   </div>
                              ))}
                         </div>
                         <div className = "items" style={{ display: (this.state.search) ? "grid" : "none" }}>
                              {searchItems.map(item => (
                                   <div className = "item-cards" key={item.original_title} onClick={()=>this.showModal(item)}>
                                        <img src = {static_url + item.poster_path} />
                                        <div className="item-cards-title">{item.original_title}</div>
                                        <div className="item-cards-year">{item.release_date}</div>
                                   </div>
                              ))}
                         </div>
                         <div className="modal" style={{ display: this.state.showInfo ? "block" : "none" }}>
                              <img className="modal-background" src = {static_url + this.state.modalState.backdrop_path} />
                              <div className="modal-content">
                                   <img src = {static_url + this.state.modalState.poster_path} />
                                   <div className="modal-text">
                                        <div className="modal-text-title">{this.state.modalState.original_title}</div>
                                        <div className="modal-text-second-line">
                                             <div className="modal-text-release-date">{this.state.modalState.release_date}</div>
                                             <div className="modal-text-separator">• </div>
                                             <div className="modal-text-genres">
                                                  {this.state.componentGenres}
                                             </div>
                                             <div className="modal-text-separator">• </div>
                                             <StarRatings
                                                  rating={this.state.modalState.vote_average}
                                                  starRatedColor="red"
                                                  numberOfStars={5}
                                                  name='rating'
                                                />
                                        </div>
                                        <div className="modal-text-description">
                                             {this.state.modalState.overview}
                                        </div>
                                   </div>
                              </div>
                              <div onClick={() => this.hideModal()}>
                                   <Close />
                              </div>
                         </div>
                         </>
                    );
               }
     }
}

export default App;
