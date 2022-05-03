import request from "supertest";
import { Contact } from "../../../src/domain/entities/contact";
import { CreateContactUseCase } from "../../../src/domain/interfaces/use-cases/create-contact";
import { GetAllContactsUseCase } from "../../../src/domain/interfaces/use-cases/get-all-contacts";
import ContactsRouter from "../../../src/presentation/routers/contact-router";
import server from "../../../src/server";

class MockGetAllContactsUseCase implements GetAllContactsUseCase {
    execute(): Promise<Contact[]> {
        throw new Error("Method not implemented.");
    }
}

class MockCreateContactUseCase implements CreateContactUseCase {
    execute(contact: Contact): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}

describe("Contact Router", () => {
    let mockCreateContactUseCase: CreateContactUseCase;
    let mockGetAllContactsUseCase: GetAllContactsUseCase;

    beforeAll(() => {
        mockCreateContactUseCase = new MockCreateContactUseCase()
        mockGetAllContactsUseCase = new MockGetAllContactsUseCase()
        server.use("/contact", ContactsRouter(mockGetAllContactsUseCase, mockCreateContactUseCase));
    })

    beforeEach(() => {
        jest.clearAllMocks();
    })

    describe("GET /contact", () => {
        it("should return 200 with contact", async () => {
            const expectedContacts = [{id: "1", email:"jdoe@email.com", firstName: "John", pseudo: "Doe"}];

            jest.spyOn(mockGetAllContactsUseCase, "execute").mockImplementation(() => Promise.resolve(expectedContacts));

            const response = await request(server).get("/contact");

            expect(response.status).toBe(200);
            expect(mockGetAllContactsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(response.body).toStrictEqual(expectedContacts);
        });

        it("should return 500 on error", async () => {
            jest.spyOn(mockGetAllContactsUseCase, "execute").mockImplementation(() => Promise.reject(Error()));

            const response = await request(server).get("/contact");

            expect(response.status).toBe(500);
            expect(mockGetAllContactsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(response.body).toStrictEqual({ message: "Error fetching data" });
        });
    });

    describe("POST /contact", () => {

        it("should return 201 with contact", async () => {
            const input = { id: "1", email:"jdoe@email.com", firstName: "John", pseudo: "Doe"};

            jest.spyOn(mockCreateContactUseCase, "execute").mockImplementation(() => Promise.resolve(true));

            const response = await request(server).post("/contact").send(input);

            expect(response.status).toBe(201);
        });

        it("should return 500 on error", async () => {
            const input = { id: "1", email:"jdoe@email.com", firstName: "John", pseudo: "Doe"};
             
            jest.spyOn(mockCreateContactUseCase, "execute").mockImplementation(() => Promise.reject(Error()));

            const response = await request(server).post("/contact").send(input);

            expect(response.status).toBe(500);
        });
    })
});