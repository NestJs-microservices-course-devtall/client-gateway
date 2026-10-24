import { Controller, Get, Post, Body, Param, Inject, Put, ParseUUIDPipe, Query, Patch } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderPaginationDto, StatusDto } from './dto';
import { PaginationDto } from 'src/common';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject( NATS_SERVICE ) private readonly client: ClientProxy 
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('create-order', createOrderDto);
  }

  @Get()
  async findAll( @Query() paginationDto: OrderPaginationDto) {

    try {

      const orders = await firstValueFrom(
        this.client.send('find-all-orders',{...paginationDto})
      )

      return orders
      
    } catch (error:any) {
      throw new RpcException( error ) 
    }
  }

  @Get('id/:id')
  async findOne(@Param('id') id: string) {

    try {
      const order = await firstValueFrom(
        this.client.send('find-one-order',{ id })
      )
      return order
    } catch (error:any) {
      throw new RpcException(error)
    }
  }

  @Put(':id')
  async chageOrderStatus(@Param('id', ParseUUIDPipe) id:string ){
    try {
      const order = await firstValueFrom(
        this.client.send('change-order-status',{ id })
      )
      return order
    } catch (error:any) {
      throw new RpcException(error)
    }
  }

  @Get(':status')
  async findAllByStatus(
    @Param('status') status: StatusDto,
    @Query() paginationDto: PaginationDto
    ){
    try {
      return this.client.send('find-all-orders', {
        ...paginationDto,
        status: status.status
      })
    } catch (error:any) {
      throw new RpcException(error)
    }
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id:string,
    @Body( ) statusDto: StatusDto
  ){

    try {
      return this.client.send('change-order-status', { id, status: statusDto.status })
    } catch (error:any) {
      throw new RpcException( error )
    }
  }

}