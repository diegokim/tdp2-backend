import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSort, MatSnackBar } from '@angular/material';
import { Denounce } from './../denounces/denounces.component';
import { DenouncesService } from './../../services/denounces.service';
import { DenouncesDataSource, DenouncesDatabase } from './../denouncestable/denouncestable.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-settings-language',
  templateUrl: './settings-language.component.html',
  styleUrls: ['./settings-language.component.css'],
  providers: [MatSnackBar]
})
export class SettingsLanguageComponent implements OnInit {

  baseUrl = 'http://localhost:5000/project/hiddenlanguage';
  postNewWord(word: string) {
    let url = this.baseUrl;
    let body = {
      word
    }
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'application/json','Authorization': token})
    return this.http.post(url, body, {headers}).toPromise()
  }
  
  
  tilesToShow = [] 
  editedWord: string;
  tiles = [];
  wordToAdd: string;  
  
  constructor(private router: Router,
  private snackBar: MatSnackBar,
  private http: HttpClient) {

  }

  ngOnInit() {
    this.getWords()
    .then( (words: WordResponse[]) => {
      this.tiles = [];
      words.forEach( (word: WordResponse) => {
        this.tiles.push(new WordContainer(word.word,word.id))
      });
      this.tilesToShow = this.tiles;
    })
    
  }

  getWords(): any {
    let url = this.baseUrl
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'application/json','Authorization': token})
    return this.http.get(url,{headers}).toPromise()
  }
  

  removeWord( index ) {
    let url = this.baseUrl + '/' + this.tilesToShow[index].id;
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'application/json','Authorization': token})
    this.http.delete(url,{headers}).toPromise()
    let realIndex = this.tiles.indexOf(this.tilesToShow[index])
    this.tiles.splice(realIndex,1)
    this.tilesToShow = this.tiles
  }

  mockWords () {
    for (let i =0 ; i <100 ; i ++) {
      this.tiles.push(new WordContainer("hola " +i, i.toString()))
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.tilesToShow = this.tiles.filter( element => {
      if ( filterValue.length != 0 ) {
        if (element.word.toLowerCase().includes(filterValue)) {
          return true;
        }
        return false;
      }
      return true
    });
  }


  editWord(index) {
    if (this.tilesToShow[index].word == "" ) {
      return this.snackBar.open('Error: la palabra no puede estar vacia!', '', {
        duration: 2000,
      });
    }
    let url = this.baseUrl + '/' + this.tilesToShow[index].id;;
    let body = {
      word: this.tilesToShow[index].word
    }
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Authorization': token})
    this.http.patch(url, body, {headers}).toPromise()
    this.tilesToShow[index].editingEnabled = false;
    let realIndex = this.tiles.indexOf(this.tilesToShow[index])
    this.tiles[realIndex] = this.tilesToShow[index]
  }

  addWord() {
    var alreadyExists = false;
    let word = this.wordToAdd;
    if (word == null || word.length == 0) {
      this.snackBar.open('Error: Has dejado el campo de palabra a agregar vacio!', '', {
        duration: 2000,
      });
      return
    } else {
      this.tiles.forEach(element => {
        if (element.word == word) {
          alreadyExists = true;
        }
      });
      if (! alreadyExists) {
        this.postNewWord(word)
        .then ( (newWord:WordResponse) => {
          this.tiles.push(new WordContainer(newWord.word,newWord.id))
          this.tilesToShow = this.tiles;
          this.snackBar.open('La palabra ha sido agregada con exito!', '', {
            duration: 2000,
          });
        }).catch ( () => {
          this.snackBar.open('Ha ocurrido un error, por favor vuelve a intentar mas tarde!', '', {
            duration: 2000,
          });
        })
        
      } else {
        this.snackBar.open('Error: La palabra ya pertenece al conjunto!', '', {
          duration: 2000,
        });
      }
    }
  }

}

class WordResponse {
  id: string;
  word: string;
}

class WordContainer {
  editingEnabled: boolean;
  id: string;
  word: string;
  constructor(word: string, id:string) {
    this.word = word
    this.id = id
    this.editingEnabled = false;
  }
}