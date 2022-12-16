import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { ItemType } from "./itemType.entity";
import { User } from "./user.entity";
import { PaymentMethod } from "./paymentMethod.entitiy";

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @ManyToOne(() => User, (user) => user.items, {
    eager: true,
  })
  @JoinColumn()
  user!: User;

  @Column({ type: "varchar" })
  ownerName!: string;

  @ManyToOne(() => ItemType, (itemType) => itemType.items, {
    eager: true,
  })
  @JoinColumn()
  itemType!: ItemType;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.items, {
    eager: true,
  })
  @JoinColumn()
  paymentMethod!: PaymentMethod;

  @Column({ type: "varchar", nullable: false })
  storageLocation!: string;

  @Column({ type: "varchar", nullable: true })
  ownerPhoneNumber!: string;

  @Column({ type: "varchar", nullable: true })
  comments?: string;

  @Column({ type: "boolean", nullable: false, default: false })
  collected?: boolean = false;

  @CreateDateColumn()
  createdAt?: Date;

  @Column({ type: "timestamptz", nullable: true, default: null })
  refunded?: Date | null = null;
}
