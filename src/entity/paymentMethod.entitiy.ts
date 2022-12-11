import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Item } from "./item.entity";

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @OneToMany(() => Item, (item) => item.itemType)
  items: Item[] | undefined;
}
