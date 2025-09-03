import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { isPlatformBrowser } from '@angular/common';

interface PieData {
  Title: string;
  Amount: number;
  Description: string;
}

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChart implements OnInit, AfterViewInit, OnDestroy {
private data: PieData[] = [
    { "Title": "cpu_vendor", "Amount": 1000, "Description": "Proizvajalec procesorja, ki označuje podjetje, ki je izdelalo procesor; ta podatek je statičen in enak na vseh napravah." },
    { "Title": "cpu_arch", "Amount": 1000, "Description": "Arhitektura procesorja, ki določa nabor ukazov in obliko procesorja; podatek je statičen in enak na vseh napravah." },
    { "Title": "cpu_model", "Amount": 1000, "Description": "Model procesorja, ki opisuje natančen tip in funkcionalnosti CPU-ja; podatek je statičen in enak na vseh napravah." },
    { "Title": "cpu_hartid", "Amount": 1000, "Description": "Identifikator prvega jedra (hart ID) iz /proc/cpuinfo; podatek je statičen in enak na vseh napravah." },
    { "Title": "mac", "Amount": 1000, "Description": "MAC naslov prvega omrežnega vmesnika, ki je unikaten za napravo; podatek je statičen in različen med napravami." },
    { "Title": "usb_mac", "Amount": 1000, "Description": "MAC naslov USB omrežnega vmesnika, ki je unikaten za napravo; podatek je statičen in različen med napravami." },
    { "Title": "machine_id", "Amount": 1000, "Description": "Edinstveni ID naprave, ki jo identificira; podatek je statičen in različen med napravami." },
    { "Title": "kernel", "Amount": 1000, "Description": "Verzija jedra Linux, ki določa funkcionalnosti in podporo strojne opreme; podatek je počasi spremenljiv in enak na vseh napravah." },
    { "Title": "kernel_conf_hash", "Amount": 1000, "Description": "SHA-256 zgoščena vrednost konfiguracije jedra, ki zagotavlja, da je jedro zgrajeno z določenimi nastavitvami; podatek je počasi spremenljiv in enak na vseh napravah." },
    { "Title": "dt_model", "Amount": 1000, "Description": "Model naprave iz Device Tree strukture; podatek je statičen in enak na vseh napravah." },
    { "Title": "dt_compatible", "Amount": 1000, "Description": "Seznam združljivih naprav za uporabo v Device Tree strukturi; podatek je statičen in enak na vseh napravah." },
    { "Title": "modules_count", "Amount": 1000, "Description": "Število trenutno naloženih kernel modulov, ki zagotavljajo dodatne funkcionalnosti OS-a; podatek je dinamičen in se lahko razlikuje med napravami." },
    { "Title": "boot_time", "Amount": 1000, "Description": "Čas, potreben za zagon sistema v sekundah; podatek je dinamičen in različen med napravami." },
    { "Title": "packages_hash", "Amount": 1000, "Description": "SHA-256 zgoščena vrednost seznama nameščenih paketov, ki omogoča preverjanje celovitosti programske opreme; podatek je počasi spremenljiv in enak na vseh napravah." },
    { "Title": "eeprom", "Amount": 1000, "Description": "Identifikacijska oznaka EEPROM čipa na napravi, ki vsebuje osnovne informacije o sistemu; podatek je statičen in različen med napravami." },
    { "Title": "loadavg", "Amount": 1000, "Description": "Povprečna obremenitev sistema v zadnjem času (1, 5 in 15 minut); podatek je dinamičen in različen med napravami." },
    { "Title": "user_processes", "Amount": 1000, "Description": "Število uporabniških procesov, ki trenutno tečejo v sistemu; podatek je dinamičen in različen med napravami." },
    { "Title": "avail_ram", "Amount": 1000, "Description": "Razpoložljiv RAM v sistemu, izražen v MB; podatek je dinamičen in različen med napravami." },
    { "Title": "disk_free_mb", "Amount": 1000, "Description": "Prost prostor na disku, izražen v MB; podatek je dinamičen in različen med napravami." },
    { "Title": "disk_io", "Amount": 1000, "Description": "Statistika vhodno-izhodnih operacij diska (prebrano:poslano); podatek je dinamičen in različen med napravami." },
    { "Title": "rx_bytes", "Amount": 1000, "Description": "Število prejetih bajtov prek omrežja; podatek je dinamičen in različen med napravami." },
    { "Title": "tx_bytes", "Amount": 1000, "Description": "Število poslanih bajtov prek omrežja; podatek je dinamičen in različen med napravami." },
    { "Title": "top5_processes", "Amount": 1000, "Description": "Pet procesov z največjo porabo CPU-ja in RAM-a v sistemu; podatek je dinamičen in različen med napravami." },
    { "Title": "gpio_value", "Amount": 1000, "Description": "Vrednosti vseh GPIO pinov, ki prikazujejo trenutno stanje vhodov/izhodov; podatek je statičen (v našem sistemu) in različen med napravami." },
    { "Title": "i2c_devices", "Amount": 1000, "Description": "Seznam naprav na I2C vodilu, ki so trenutno zaznane; podatek je počasi spremenljiv in enak na vseh napravah." },
    { "Title": "device_hash", "Amount": 1000, "Description": "Unikatni hash naprave, ki omogoča preverjanje njene identitete; podatek je statičen in različen med napravami." },
    { "Title": "working_state", "Amount": 1000, "Description": "Trenutno stanje delovanja naprave (DATA/working_state.txt); podatek je dinamičen in različen med napravami." },
    { "Title": "current_job", "Amount": 1000, "Description": "Trenutno izvajana naloga na napravi (DATA/current_job.txt); podatek je dinamičen in različen med napravami." }
];



  private svg: any = null;
  private width: number = 0;
  private height: number = 0;
  private radius: number = 0;
  private total: number = 0;
  private buttonToggle: boolean = true;
  private prevSegment: any = null;
  private timeline: any = null;
  private isBrowser: boolean = false;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.data.forEach((d) => {
      this.total += d.Amount;
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initChart();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.timeline) {
      this.timeline.kill();
    }
  }

  private initChart(): void {
    if (!this.isBrowser) return;
    
    const container = this.elementRef.nativeElement.querySelector('#pieChart');
    if (!container) return;
    
    if (typeof getComputedStyle === 'undefined') {
      console.warn('getComputedStyle is not available');
      return;
    }
    
    const containerStyle = getComputedStyle(container);
    this.width = parseInt(containerStyle.width, 10) || 400;
    this.height = this.width;
    this.radius = (Math.min(this.width, this.height) - 15) / 2;

    const innerRadiusValue = containerStyle.counterReset?.split(' ')[1] || '80';
    const innerRadius = parseInt(innerRadiusValue, 10);

    const arcOver = d3.arc()
      .outerRadius(this.radius + 10)
      .innerRadius(innerRadius);

    const arc = d3.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(innerRadius);

    // Create an arc for label positioning inside the slices
    const labelArc = d3.arc()
      .outerRadius(this.radius * 0.6)  // Position labels at 60% of the radius
      .innerRadius(this.radius * 0.6);

    const color = d3.scaleOrdinal(); 
    color.domain(this.getTitles(this.data))
      .range(["#2BDFBB", "#DF2B4F", "#EE6617", "#FFBF00", '#423E6E', '#E24161', '#2B67DF', '#DF2BBB', '#67EE17', '#BF007F', '#E2B141']);

    const pie = d3.pie<PieData>()
      .sort(null)
      .value((d: any) => d.Amount);

    let sliceDirection = 90;
    if (window.matchMedia("(max-width: 767px)").matches) {
      sliceDirection = 180;
    }

    this.svg = d3.select(container).append("svg")
      .attr("width", '100%')
      .attr("height", '100%')
      .attr('viewBox', `0 0 ${Math.min(this.width, this.height)} ${Math.min(this.width, this.height)}`)
      .attr('preserveAspectRatio', 'xMinYMin')
      .append("g")
      .attr("transform", `translate(${this.radius},${this.height / 2})`)
      .style("filter", "url(#drop-shadow)");

    const defs = this.svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5.5)
      .attr("result", "blur");

    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("result", "offsetBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    const g = this.svg.selectAll(".arc")
      .data(pie(this.data))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", (d: any) => color(d.data.Title))
      .on("click", (event: any, d: any) => {
        this.onSegmentClick(event, d, arc, arcOver, sliceDirection);
      });

    // Add labels inside each pie slice with proper rotation
    g.append("text")
      .attr("transform", (d: any) => {
        const pos = labelArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        const degrees = midAngle * (180 / Math.PI) - 90; // Convert to degrees and adjust for text orientation
        
        // Rotate text to face outward from the center
        return `translate(${pos}) rotate(${degrees})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("pointer-events", "none") // Prevent text from blocking slice clicks
      .text((d: any) => d.data.Title);

    this.initAnimations();
  }

  private initAnimations(): void {
    if (!this.isBrowser) return;
    
    this.timeline = gsap.timeline();
    
    this.timeline.from('#pieChart', {
      duration: 0.5,
      rotation: -120,
      scale: 0.1,
      opacity: 0,
      ease: "power3.out"
    }).from('.panel', {
      duration: 0.75,
      width: '0%',
      opacity: 0,
      ease: "none",
      onComplete: () => { 
        const contentWrapper = this.elementRef.nativeElement.querySelector('.content-wrapper');
        if (contentWrapper) contentWrapper.style.display = 'block'; 
      }
    }, '+=0.55').from('.content-wrapper', {
      duration: 0.75,
      rotationX: -90,
      opacity: 0,
      ease: "none"
    });
  }

  private getTitles(obj: PieData[]): string[] {
    return obj.map(item => item.Title);
  }

  private onSegmentClick(event: any, d: any, arc: any, arcOver: any, sliceDirection: number): void {
    if (!this.isBrowser) return;
    
    if (this.buttonToggle) {
      this.buttonToggle = false;
      this.switchToggle();
      
      this.changeSegment(d, event.target, arc, arcOver, sliceDirection);
      
      this.animateContentChange(d);
    }
  }

  private animateContentChange(d: any): void {
    if (!this.isBrowser) return;
    
    const timeline = gsap.timeline();
    
    timeline.to('.content-wrapper', {
      duration: 0.5,
      rotationX: 90,
      opacity: 0,
      ease: "none",
      onComplete: () => {
        const contentWrapper = this.elementRef.nativeElement.querySelector('.content-wrapper');
        if (contentWrapper) contentWrapper.style.display = 'none';
      }
    }).to('.panel', {
      duration: 0.5,
      width: '0%',
      opacity: 0.05,
      ease: "none",
      onComplete: () => {
        this.updateContent(d);
      }
    });

    timeline.to('.panel', {
      duration: 0.5,
      width: '100%',
      opacity: 1,
      ease: "none",
      onComplete: () => {
        const contentWrapper = this.elementRef.nativeElement.querySelector('.content-wrapper');
        if (contentWrapper) contentWrapper.style.display = 'block';
      }
    }).to('.content-wrapper', {
      duration: 0.5,
      rotationX: 0,
      opacity: 1,
      ease: "none"
    });
  }

  private updateContent(d: any): void {
    if (!this.isBrowser) return;
    
    const segmentTitle = this.elementRef.nativeElement.querySelector('#segmentTitle');
    const segmentText = this.elementRef.nativeElement.querySelector('#segmentText');
    const panel = this.elementRef.nativeElement.querySelector('.panel');
    
    if (segmentTitle) {
      segmentTitle.innerHTML = `${d.data.Title}`;
    }
    
    if (segmentText) {
      segmentText.innerHTML = d.data.Description;
    }
    
    if (panel) {
      panel.style.backgroundColor = '#14cc4b'; 
    }
  }

  private changeSegment(d: any, target: any, arc: any, arcOver: any, sliceDirection: number): void {
    if (!this.isBrowser) return;
    
    const angle = sliceDirection - ((d.startAngle * (180 / Math.PI)) + ((d.endAngle - d.startAngle) * (180 / Math.PI) / 2));

    this.svg.transition()
      .duration(1000)
      .attr("transform", `translate(${this.radius},${this.height / 2}) rotate(${angle})`);
    
    if (this.prevSegment) {
      d3.select(this.prevSegment)
        .transition()
        .attr("d", arc)
        .style('filter', '');
    }
    
    this.prevSegment = target;

    d3.select(target)
      .transition()
      .duration(1000)
      .attr("d", arcOver)
      .style("filter", "url(#drop-shadow)");
  }

  private switchToggle(): void {
    if (!this.isBrowser) return;
    
    setTimeout(() => {
      this.buttonToggle = true;
    }, 1500);
  }
}