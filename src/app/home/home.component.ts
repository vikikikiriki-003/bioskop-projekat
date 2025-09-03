import { Component, OnDestroy, OnInit, QueryList, ViewChildren, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { AxiosError } from 'axios';
import { MovieModel } from '../../models/movie.model';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from "@angular/router";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: Function;
  }
}

interface Slide {
  src: string;
  alt: string;
  type: 'video' | 'youtube';
  youtubeId?: string;
  endTime?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChildren('youtubeFrame') youtubeFrames!: QueryList<ElementRef<HTMLIFrameElement>>;

  movies : MovieModel[] | null = null
  error : string | null = null
  
  // Slideshow properties
  slides: Slide[] = [
    { src: '/assets/home.mp4', alt: 'Slide 1', type: 'video' },
    { src: '/assets/hero1.mp4', alt: 'Slide 2', type: 'video' },
    { src: '/assets/hero2.mp4', alt: 'Slide 3', type: 'video' },
    { src: '/assets/hero3.mp4', alt: 'Slide 4', type: 'video' },
  ];
  
  currentSlide = 0;
  ytPlayers: any[] = [];
  
  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ){
    MovieService.getMovies(0, 3)
      .then(rsp=> this.movies = rsp.data.slice(0,3))
      .catch((e : AxiosError) => this.error = `${e.code} ${e.message}`)
  }
  
  ngOnInit(): void {
    // No need to load YouTube API anymore
  }

  loadYouTubeAPI(): void {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }

  getYouTubeEmbedUrl(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=0&autoplay=1&mute=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`
    );
  }

  onYouTubeIframeAPIReady(slideIndex: number): void {
    const slide = this.slides[slideIndex];
    if (slide.type === 'youtube' && slide.youtubeId && window.YT && window.YT.Player) {
      this.ytPlayers[slideIndex] = new window.YT.Player(`youtube-player-${slideIndex}`, {
        videoId: slide.youtubeId,
        playerVars: {
          'autoplay': 0,
          'controls': 0,
          'showinfo': 0,
          'rel': 0,
          'modestbranding': 1,
          'mute': 1
        },
        events: {
          'onReady': (event: any) => {
            if (slideIndex === this.currentSlide) {
              event.target.playVideo();
              
              // Set up timer to end at specific time if needed
              if (slide.endTime) {
                const checkTimeInterval = setInterval(() => {
                  const currentTime = event.target.getCurrentTime();
                  if (currentTime >= slide.endTime!) {
                    clearInterval(checkTimeInterval);
                    this.videoEnded();
                  }
                }, 500); // Check every half second
              }
            } else {
              event.target.pauseVideo();
            }
          },
          'onStateChange': (event: any) => {
            // When video ends (state = 0), go to next slide
            if (event.data === 0) {
              this.videoEnded();
            }
          }
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // Wait for DOM to be ready before initializing videos
    setTimeout(() => {
      this.initializeVideos();
      
      // No YouTube videos to set up anymore
    }, 500);
  }
  
  setupYouTubeVideos(): void {
    this.slides.forEach((slide, index) => {
      if (slide.type === 'youtube') {
        this.onYouTubeIframeAPIReady(index);
      }
    });
  }
  
  ngOnDestroy(): void {
    // Pause all videos to avoid memory leaks
    this.pauseAllVideos();
    
    // Clean up YouTube players
    this.ytPlayers.forEach(player => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    });
  }

  // Initialize videos on component load
  initializeVideos(): void {
    console.log('Initializing videos...');
    console.log('Video elements count:', this.videoElements?.length);
    
    // Pause all videos first
    this.pauseAllVideos();
    
    // Then play only the current slide's video
    this.playCurrentContent();
  }
  
  // Pause all videos
  pauseAllVideos(): void {
    // Pause regular videos
    if (this.videoElements && this.videoElements.length > 0) {
      this.videoElements.forEach((videoRef, index) => {
        try {
          const video = videoRef.nativeElement;
          video.pause();
          console.log(`Paused video ${index}`);
        } catch (error) {
          console.error(`Error pausing video ${index}:`, error);
        }
      });
    }
  }
  
  // Play the current slide's content (video or YouTube)
  playCurrentContent(): void {
    const currentSlide = this.slides[this.currentSlide];
    
    // All slides are now video type
    this.playCurrentVideo();
  }
  
  // Play only the current slide's video
  playCurrentVideo(): void {
    if (this.videoElements && this.videoElements.length > 0) {
      const videoArray = this.videoElements.toArray();
      // We need to find the video corresponding to the current slide
      // This is more complex now since not all slides are videos
      let videoIndex = 0;
      for (let i = 0; i < this.currentSlide; i++) {
        if (this.slides[i].type === 'video') {
          videoIndex++;
        }
      }
      
      if (videoArray[videoIndex]) {
        try {
          const currentVideo = videoArray[videoIndex].nativeElement;
          currentVideo.currentTime = 0;
          currentVideo.muted = true;
          
          console.log(`Playing video at index ${videoIndex} for slide ${this.currentSlide}`);
          // Using a promise to ensure playback starts
          const playPromise = currentVideo.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`Video playing successfully`);
              })
              .catch(error => {
                console.error(`Video playback error:`, error);
                // Try again with user interaction
                setTimeout(() => {
                  currentVideo.play().catch(e => console.error('Second attempt failed:', e));
                }, 1000);
              });
          }
        } catch (error) {
          console.error(`Error playing video:`, error);
        }
      }
    }
  }
  
  // Play the current YouTube video
  playCurrentYouTube(): void {
    const player = this.ytPlayers[this.currentSlide];
    if (player && typeof player.playVideo === 'function') {
      try {
        player.seekTo(0);
        player.playVideo();
        console.log(`Playing YouTube video at slide ${this.currentSlide}`);
        
        // Set up timer for end time if specified
        const slide = this.slides[this.currentSlide];
        if (slide.endTime) {
          const checkTimeInterval = setInterval(() => {
            const currentTime = player.getCurrentTime();
            if (currentTime >= slide.endTime!) {
              clearInterval(checkTimeInterval);
              this.videoEnded();
            }
          }, 500);
        }
      } catch (error) {
        console.error(`Error playing YouTube video:`, error);
      }
    } else {
      console.warn(`YouTube player not ready for slide ${this.currentSlide}`);
    }
  }
  
  videoEnded(): void {
    console.log('Content ended, moving to next slide');
    // Move to the next slide when the current video ends
    this.nextSlide();
  }
  
  prevSlide(): void {
    this.currentSlide = (this.currentSlide === 0) ? this.slides.length - 1 : this.currentSlide - 1;
    this.handleSlideChange();
  }
  
  nextSlide(): void {
    this.currentSlide = (this.currentSlide === this.slides.length - 1) ? 0 : this.currentSlide + 1;
    this.handleSlideChange();
  }
  
  goToSlide(index: number): void {
    if (this.currentSlide === index) return;
    this.currentSlide = index;
    this.handleSlideChange();
  }
  
  handleSlideChange(): void {
    console.log(`Changing to slide ${this.currentSlide}`);
    // First pause all videos
    this.pauseAllVideos();
    
    // Then play the current content
    this.playCurrentContent();
  }
}
