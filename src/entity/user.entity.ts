import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Item } from "./item.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column({ type: "varchar", unique: true })
  username!: string;

  @Column({ type: "varchar" })
  firstName!: string;

  @Column({ type: "varchar" })
  lastName!: string;

  @Column({ type: "varchar", nullable: true })
  hash?: string;

  @OneToMany(() => Item, (item) => item.user)
  items: Item[] | undefined;
}
