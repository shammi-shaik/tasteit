import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../order.service';

@Component({
  selector: 'app-seller-orders',
  templateUrl: './seller-orders.component.html',
  styleUrls: ['./seller-orders.component.css']
})
export class SellerOrdersComponent implements OnInit {
  Mydishes: any[] = [];


  constructor( private orderService:OrdersService) { }

  ngOnInit(): void {
    this.fetchSellerOrders();
  }

  fetchSellerOrders():void{
    this.orderService.getSellerOrders().subscribe(
      response =>{
        this.Mydishes=response.orders.sort((a: any, b: any) => 
        new Date(b.order_time).getTime() - new Date(a.order_time).getTime()
      );        
      },
      error =>{
        console.error('error is ',error)
      }
    )
  }

}
