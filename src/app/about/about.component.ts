import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit, AfterViewInit {

  isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {

  }
  
  ngAfterViewInit(): void {
    if (this.isBrowser) {

      this.initParallaxEffect();
      
      this.initializeVideos();
    }
  }
  
  private initParallaxEffect(): void {
    const storyVideo = document.querySelector('.story-video') as HTMLVideoElement;
    if (!storyVideo) return;
    
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      if (storyVideo) {
        storyVideo.style.transform = `translateY(-${scrollPosition * 0.05}px) scale(1.01)`;
      }
    });
  }
  
  private initializeVideos(): void {
    const videos = document.querySelectorAll('video') as NodeListOf<HTMLVideoElement>;
    
    if (!videos || videos.length === 0) {
      console.warn('No video elements found on the page');
      return;
    }
    
    console.log(`Found ${videos.length} videos to initialize`);
    
    videos.forEach((video, index) => {
      video.preload = 'auto';
      
      video.setAttribute('playsinline', '');
      
      const sources = video.querySelectorAll('source');
      if (sources.length) {
        console.log(`Video ${index} source: ${sources[0].src}`);
        console.log(`Video ${index} type: ${sources[0].type}`);
        
        sources[0].addEventListener('error', (e) => {
          console.error(`Error loading video source ${index}:`, e);
          console.error(`Failed URL: ${sources[0].src}`);
          this.handleVideoError(video, index);
        });
      } else {
        console.warn(`Video ${index} has no source elements`);
        this.handleVideoError(video, index);
      }
      
      video.load();
      
      video.addEventListener('error', (e) => {
        console.error(`Error loading video ${index}:`, e);
        console.error(`Error code: ${video.error?.code}`);
        console.error(`Error message: ${video.error?.message}`);
        this.handleVideoError(video, index);
      });
      
      video.addEventListener('loadedmetadata', () => {
        console.log(`Video ${index} metadata loaded successfully`);
        console.log(`Video ${index} duration: ${video.duration}s`);
        console.log(`Video ${index} dimensions: ${video.videoWidth}x${video.videoHeight}`);
      });
      
      video.addEventListener('canplay', () => {
        console.log(`Video ${index} is ready to play`);
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log(`Video ${index} playing successfully`);
          }).catch(e => {
            console.error(`Error playing video ${index}:`, e);
            
            if (e.name === 'NotAllowedError') {
              console.warn(`Autoplay blocked for video ${index}, adding click-to-play`);
              const parent = video.parentElement;
              if (parent) {
                const playButton = document.createElement('button');
                playButton.textContent = 'Play Video';
                playButton.className = 'video-play-button';
                playButton.style.position = 'absolute';
                playButton.style.zIndex = '10';
                playButton.style.top = '50%';
                playButton.style.left = '50%';
                playButton.style.transform = 'translate(-50%, -50%)';
                playButton.style.padding = '10px 20px';
                playButton.style.backgroundColor = '#ff4081';
                playButton.style.color = 'white';
                playButton.style.border = 'none';
                playButton.style.borderRadius = '4px';
                playButton.style.cursor = 'pointer';
                
                playButton.addEventListener('click', () => {
                  video.play().then(() => {
                    playButton.remove();
                  }).catch(err => {
                    console.error('Error playing video after click:', err);
                  });
                });
                
                parent.appendChild(playButton);
              }
            } else {
              this.handleVideoError(video, index);
            }
          });
        }
      });
    });
  }
  
  private handleVideoError(video: HTMLVideoElement, index: number): void {
    const parent = video.parentElement;
    if (!parent) return;
    
    parent.style.backgroundColor = 'var(--dark-color)';
    
    console.log(`Setting fallback for video ${index}`);
    
    if (video.classList.contains('hero-video')) {
      parent.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url("/assets/image5.jpeg")';
      parent.style.backgroundSize = 'cover';
      parent.style.backgroundPosition = 'center';
    } else if (video.classList.contains('story-video')) {
      parent.style.backgroundImage = 'url("/assets/about-img.jpeg")';
      parent.style.backgroundSize = 'cover';
      parent.style.backgroundPosition = 'center';
    } else if (video.classList.contains('gallery-video')) {
      parent.style.backgroundImage = 'url("/assets/image1.jpeg")';
      parent.style.backgroundSize = 'cover';
      parent.style.backgroundPosition = 'center';
    }
    
    video.style.display = 'none';
  }
}
